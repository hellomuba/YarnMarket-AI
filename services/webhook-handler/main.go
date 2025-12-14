// YarnMarket AI WhatsApp Webhook Handler
// High-performance Go service for handling WhatsApp Business API webhooks

package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/streadway/amqp"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	_ "github.com/lib/pq"
)

// Configuration
type Config struct {
	Port                 string
	RedisURL             string
	RabbitMQURL          string
	DatabaseURL          string
	WhatsAppVerifyToken  string
	WhatsAppAccessToken  string
	WhatsAppPhoneNumberID string
	ConversationAPIURL   string
}

// WhatsApp message structures
type WhatsAppWebhook struct {
	Object string `json:"object"`
	Entry  []struct {
		ID      string `json:"id"`
		Changes []struct {
			Value struct {
				MessagingProduct string `json:"messaging_product"`
				Metadata         struct {
					DisplayPhoneNumber string `json:"display_phone_number"`
					PhoneNumberID      string `json:"phone_number_id"`
				} `json:"metadata"`
				Contacts []struct {
					Profile struct {
						Name string `json:"name"`
					} `json:"profile"`
					WaID string `json:"wa_id"`
				} `json:"contacts"`
				Messages []struct {
					From      string `json:"from"`
					ID        string `json:"id"`
					Timestamp string `json:"timestamp"`
					Type      string `json:"type"`
					Text      *struct {
						Body string `json:"body"`
					} `json:"text,omitempty"`
					Audio *struct {
						ID       string `json:"id"`
						MimeType string `json:"mime_type"`
					} `json:"audio,omitempty"`
					Image *struct {
						ID       string `json:"id"`
						MimeType string `json:"mime_type"`
						Sha256   string `json:"sha256"`
						Caption  string `json:"caption"`
					} `json:"image,omitempty"`
					Interactive *struct {
						Type        string `json:"type"`
						ButtonReply *struct {
							ID    string `json:"id"`
							Title string `json:"title"`
						} `json:"button_reply,omitempty"`
					} `json:"interactive,omitempty"`
				} `json:"messages"`
				Statuses []struct {
					ID           string `json:"id"`
					Status       string `json:"status"`
					Timestamp    string `json:"timestamp"`
					RecipientID  string `json:"recipient_id"`
					Conversation *struct {
						ID     string `json:"id"`
						Origin struct {
							Type string `json:"type"`
						} `json:"origin"`
					} `json:"conversation,omitempty"`
				} `json:"statuses"`
			} `json:"value"`
			Field string `json:"field"`
		} `json:"changes"`
	} `json:"entry"`
}

// Processing job for message queue
type ProcessingJob struct {
	MessageID      string                 `json:"message_id"`
	From           string                 `json:"from"`
	To             string                 `json:"to"`
	Type           string                 `json:"type"`
	Content        string                 `json:"content"`
	AudioID        string                 `json:"audio_id,omitempty"`
	ImageID        string                 `json:"image_id,omitempty"`
	InteractiveData map[string]interface{} `json:"interactive_data,omitempty"`
	Timestamp      string                 `json:"timestamp"`
	ReceivedAt     time.Time              `json:"received_at"`
	BusinessPhone  string                 `json:"business_phone"`
	MerchantID     string                 `json:"merchant_id"`
}

// Response structures
type WhatsAppResponse struct {
	To   string      `json:"to"`
	Type string      `json:"type"`
	Text *TextBody   `json:"text,omitempty"`
	Interactive *InteractiveBody `json:"interactive,omitempty"`
}

type TextBody struct {
	Body string `json:"body"`
}

type InteractiveBody struct {
	Type   string `json:"type"`
	Body   *struct {
		Text string `json:"text"`
	} `json:"body,omitempty"`
	Action *struct {
		Buttons []struct {
			Type  string `json:"type"`
			Reply struct {
				ID    string `json:"id"`
				Title string `json:"title"`
			} `json:"reply"`
		} `json:"buttons"`
	} `json:"action,omitempty"`
}

// Prometheus metrics
var (
	webhookRequests = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "whatsapp_webhook_requests_total",
			Help: "Total number of webhook requests received",
		},
		[]string{"status"},
	)
	
	messageProcessingDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "message_processing_duration_seconds",
			Help:    "Duration of message processing",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"message_type"},
	)
	
	activeConnections = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_whatsapp_connections",
			Help: "Number of active WhatsApp connections",
		},
	)
)

func init() {
	prometheus.MustRegister(webhookRequests)
	prometheus.MustRegister(messageProcessingDuration)
	prometheus.MustRegister(activeConnections)
}

// WebhookHandler handles WhatsApp webhooks
type WebhookHandler struct {
	config      *Config
	db          *sql.DB
	redisClient *redis.Client
	rabbitConn  *amqp.Connection
	rabbitCh    *amqp.Channel
	httpClient  *http.Client
}

func NewWebhookHandler(config *Config) (*WebhookHandler, error) {
	// PostgreSQL connection
	db, err := sql.Open("postgres", config.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test database connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("database connection failed: %v", err)
	}
	log.Println("✅ Database connection established")

	// Redis connection
	opt, err := redis.ParseURL(config.RedisURL)
	if err != nil {
		return nil, fmt.Errorf("invalid Redis URL: %v", err)
	}
	redisClient := redis.NewClient(opt)

	// Test Redis connection
	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	if err := redisClient.Ping(ctx2).Err(); err != nil {
		return nil, fmt.Errorf("Redis connection failed: %v", err)
	}

	// RabbitMQ connection
	conn, err := amqp.Dial(config.RabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open RabbitMQ channel: %v", err)
	}

	// Declare queue
	_, err = ch.QueueDeclare(
		"message_processing", // name
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		return nil, fmt.Errorf("failed to declare queue: %v", err)
	}

	return &WebhookHandler{
		config:      config,
		db:          db,
		redisClient: redisClient,
		rabbitConn:  conn,
		rabbitCh:    ch,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}, nil
}

// VerifyWebhook handles WhatsApp webhook verification
func (wh *WebhookHandler) VerifyWebhook(c *gin.Context) {
	mode := c.Query("hub.mode")
	token := c.Query("hub.verify_token")
	challenge := c.Query("hub.challenge")

	log.Printf("Webhook verification: mode=%s, token=%s", mode, token)

	if mode == "subscribe" && token == wh.config.WhatsAppVerifyToken {
		log.Println("✅ Webhook verification successful")
		c.String(http.StatusOK, challenge)
		return
	}

	log.Println("❌ Webhook verification failed")
	c.JSON(http.StatusForbidden, gin.H{"error": "Verification failed"})
}

// HandleWebhook processes incoming WhatsApp messages
func (wh *WebhookHandler) HandleWebhook(c *gin.Context) {
	start := time.Now()
	
	var payload WhatsAppWebhook
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("❌ Invalid webhook payload: %v", err)
		webhookRequests.WithLabelValues("invalid").Inc()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Quick acknowledgment to WhatsApp
	c.JSON(http.StatusOK, gin.H{"status": "received"})
	webhookRequests.WithLabelValues("success").Inc()

	// Process messages in background
	go wh.processWebhookPayload(payload, start)
}

func (wh *WebhookHandler) processWebhookPayload(payload WhatsAppWebhook, startTime time.Time) {
	for _, entry := range payload.Entry {
		for _, change := range entry.Changes {
			if change.Field != "messages" {
				continue
			}

			businessPhone := change.Value.Metadata.DisplayPhoneNumber
			
			// Get merchant ID from business phone
			merchantID, err := wh.getMerchantID(businessPhone)
			if err != nil {
				log.Printf("❌ Failed to get merchant ID for %s: %v", businessPhone, err)
				continue
			}

			// Process messages
			for _, msg := range change.Value.Messages {
				job := ProcessingJob{
					MessageID:     msg.ID,
					From:          msg.From,
					To:            businessPhone,
					Type:          msg.Type,
					Timestamp:     msg.Timestamp,
					ReceivedAt:    time.Now(),
					BusinessPhone: businessPhone,
					MerchantID:    merchantID,
				}

				// Extract content based on message type
				switch msg.Type {
				case "text":
					if msg.Text != nil {
						job.Content = msg.Text.Body
					}
				case "audio":
					if msg.Audio != nil {
						job.AudioID = msg.Audio.ID
						job.Content = "[Audio Message]"
					}
				case "image":
					if msg.Image != nil {
						job.ImageID = msg.Image.ID
						job.Content = msg.Image.Caption
					}
				case "interactive":
					if msg.Interactive != nil {
						job.InteractiveData = map[string]interface{}{
							"type": msg.Interactive.Type,
						}
						if msg.Interactive.ButtonReply != nil {
							job.InteractiveData["button_reply"] = map[string]string{
								"id":    msg.Interactive.ButtonReply.ID,
								"title": msg.Interactive.ButtonReply.Title,
							}
							job.Content = msg.Interactive.ButtonReply.Title
						}
					}
				}

				// Queue for processing
				if err := wh.queueMessage(job); err != nil {
					log.Printf("❌ Failed to queue message %s: %v", msg.ID, err)
				} else {
					log.Printf("✅ Queued message %s from %s (type: %s)", msg.ID, msg.From, msg.Type)
				}

				// Record processing time metric
				messageProcessingDuration.WithLabelValues(msg.Type).Observe(time.Since(startTime).Seconds())
			}

			// Process status updates
			for _, status := range change.Value.Statuses {
				log.Printf("📊 Message status update: %s -> %s", status.ID, status.Status)
				
				// Store status in Redis for tracking
				statusKey := fmt.Sprintf("status:%s", status.ID)
				wh.redisClient.Set(context.Background(), statusKey, status.Status, 24*time.Hour)
			}
		}
	}
}

func (wh *WebhookHandler) getMerchantID(businessPhone string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Try to get from cache first
	cacheKey := fmt.Sprintf("merchant:phone:%s", businessPhone)
	merchantID, err := wh.redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		log.Printf("✅ Cache hit: merchant %s for phone %s", merchantID, businessPhone)
		return merchantID, nil
	}

	// Query database to get merchant ID by business phone
	log.Printf("🔍 Looking up merchant for phone: %s", businessPhone)

	var dbMerchantID string
	query := `
		SELECT id::text
		FROM merchants
		WHERE phone_number = $1
		  AND status = 'active'
		  AND phone_number_id IS NOT NULL
		LIMIT 1
	`

	err = wh.db.QueryRowContext(ctx, query, businessPhone).Scan(&dbMerchantID)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("❌ No merchant found for phone %s", businessPhone)
			return "", fmt.Errorf("merchant not found for phone %s", businessPhone)
		}
		log.Printf("❌ Database query error: %v", err)
		return "", fmt.Errorf("database error: %v", err)
	}

	log.Printf("✅ Found merchant %s for phone %s", dbMerchantID, businessPhone)

	// Cache the result for 1 hour
	wh.redisClient.Set(ctx, cacheKey, dbMerchantID, time.Hour)

	return dbMerchantID, nil
}

func (wh *WebhookHandler) queueMessage(job ProcessingJob) error {
	body, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %v", err)
	}

	err = wh.rabbitCh.Publish(
		"",                   // exchange
		"message_processing", // routing key
		false,                // mandatory
		false,                // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent, // Persist messages
			Timestamp:    time.Now(),
		},
	)
	
	if err != nil {
		return fmt.Errorf("failed to publish message: %v", err)
	}

	return nil
}

// SendMessage sends a message via WhatsApp Business API
func (wh *WebhookHandler) SendMessage(c *gin.Context) {
	var response WhatsAppResponse
	if err := c.ShouldBindJSON(&response); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message format"})
		return
	}

	// Send to WhatsApp API
	if err := wh.sendToWhatsApp(response); err != nil {
		log.Printf("❌ Failed to send message: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "sent"})
}

func (wh *WebhookHandler) sendToWhatsApp(response WhatsAppResponse) error {
	if wh.config.WhatsAppPhoneNumberID == "" {
		return fmt.Errorf("WHATSAPP_PHONE_NUMBER_ID not configured")
	}

	url := fmt.Sprintf("https://graph.facebook.com/v18.0/%s/messages",
		wh.config.WhatsAppPhoneNumberID)

	// Set messaging_product for WhatsApp API
	payload := map[string]interface{}{
		"messaging_product": "whatsapp",
		"to":                response.To,
		"type":              response.Type,
	}

	if response.Text != nil {
		payload["text"] = map[string]string{
			"body": response.Text.Body,
		}
	}

	if response.Interactive != nil {
		payload["interactive"] = response.Interactive
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal response: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+wh.config.WhatsAppAccessToken)

	resp, err := wh.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("WhatsApp API error (status %d): %s", resp.StatusCode, string(body))
	}

	log.Printf("✅ Message sent successfully to %s", response.To)
	log.Printf("📤 WhatsApp API response: %s", string(body))
	return nil
}

// StartOutgoingMessageConsumer starts consuming outgoing messages from RabbitMQ
func (wh *WebhookHandler) StartOutgoingMessageConsumer() error {
	// Declare outgoing queue
	queue, err := wh.rabbitCh.QueueDeclare(
		"outgoing_messages", // name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare outgoing queue: %v", err)
	}

	// Start consuming
	msgs, err := wh.rabbitCh.Consume(
		queue.Name, // queue
		"",         // consumer
		false,      // auto-ack
		false,      // exclusive
		false,      // no-local
		false,      // no-wait
		nil,        // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %v", err)
	}

	// Process messages in background
	go func() {
		for msg := range msgs {
			var outgoingMsg struct {
				To         string `json:"to"`
				MerchantID string `json:"merchant_id"`
				Text       string `json:"text"`
				MessageID  string `json:"message_id"`
			}

			if err := json.Unmarshal(msg.Body, &outgoingMsg); err != nil {
				log.Printf("❌ Failed to unmarshal outgoing message: %v", err)
				msg.Nack(false, false)
				continue
			}

			log.Printf("📬 Processing outgoing message to %s", outgoingMsg.To)

			// Prepare WhatsApp response
			response := WhatsAppResponse{
				To:   outgoingMsg.To,
				Type: "text",
				Text: &TextBody{
					Body: outgoingMsg.Text,
				},
			}

			// Send to WhatsApp
			if err := wh.sendToWhatsApp(response); err != nil {
				log.Printf("❌ Failed to send message to WhatsApp: %v", err)
				msg.Nack(false, true) // Requeue on failure
			} else {
				log.Printf("✅ Sent message to %s", outgoingMsg.To)
				msg.Ack(false)
			}
		}
	}()

	log.Println("✅ Started consuming outgoing messages")
	return nil
}

// Health check endpoint
func (wh *WebhookHandler) HealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Check database connection
	if err := wh.db.PingContext(ctx); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"error":  "Database connection failed",
		})
		return
	}

	// Check Redis connection
	if err := wh.redisClient.Ping(ctx).Err(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"error":  "Redis connection failed",
		})
		return
	}

	// Check RabbitMQ connection
	if wh.rabbitConn.IsClosed() {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"error":  "RabbitMQ connection closed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "whatsapp-webhook-handler",
		"timestamp": time.Now().UTC(),
	})
}

func (wh *WebhookHandler) Close() {
	if wh.rabbitCh != nil {
		wh.rabbitCh.Close()
	}
	if wh.rabbitConn != nil {
		wh.rabbitConn.Close()
	}
	if wh.redisClient != nil {
		wh.redisClient.Close()
	}
	if wh.db != nil {
		wh.db.Close()
	}
}

func loadConfig() *Config {
	return &Config{
		Port:                 getEnv("PORT", "8080"),
		RedisURL:             getEnv("REDIS_URL", "redis://localhost:6379"),
		RabbitMQURL:          getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		DatabaseURL:          getEnv("DATABASE_URL", "postgresql://yarnmarket:password@localhost:5432/yarnmarket"),
		WhatsAppVerifyToken:  getEnv("WHATSAPP_VERIFY_TOKEN", ""),
		WhatsAppAccessToken:  getEnv("WHATSAPP_ACCESS_TOKEN", ""),
		WhatsAppPhoneNumberID: getEnv("WHATSAPP_PHONE_NUMBER_ID", ""),
		ConversationAPIURL:   getEnv("CONVERSATION_API_URL", "http://localhost:8001"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	log.Println("🚀 Starting YarnMarket AI WhatsApp Webhook Handler...")

	config := loadConfig()

	// Validate required environment variables
	if config.WhatsAppVerifyToken == "" {
		log.Fatal("❌ WHATSAPP_VERIFY_TOKEN is required")
	}

	// Initialize webhook handler
	handler, err := NewWebhookHandler(config)
	if err != nil {
		log.Fatalf("❌ Failed to initialize webhook handler: %v", err)
	}
	defer handler.Close()

	// Start consuming outgoing messages
	if err := handler.StartOutgoingMessageConsumer(); err != nil {
		log.Fatalf("❌ Failed to start outgoing message consumer: %v", err)
	}

	// Setup Gin router
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Routes
	router.GET("/webhook", handler.VerifyWebhook)
	router.POST("/webhook", handler.HandleWebhook)
	router.POST("/send", handler.SendMessage)
	router.GET("/health", handler.HealthCheck)
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Start server
	server := &http.Server{
		Addr:    ":" + config.Port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		log.Printf("✅ Webhook handler listening on port %s", config.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down webhook handler...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("❌ Server shutdown error: %v", err)
	}

	log.Println("✅ Webhook handler shutdown complete")
}