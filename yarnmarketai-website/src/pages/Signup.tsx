import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const Signup = () => {
  const [activeTab, setActiveTab] = useState<"signup" | "signin">("signup");

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 pt-24">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
              >
                YarnMarket AI
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold">
              Start selling today
            </CardTitle>
            <CardDescription>
              Create your multilingual conversational store in minutes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveTab("signin")}
                className={`py-2 px-4 rounded-md transition-all ${
                  activeTab === "signin"
                    ? "bg-primary text-primary-foreground shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`py-2 px-4 rounded-md transition-all ${
                  activeTab === "signup"
                    ? "bg-primary text-primary-foreground shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>

              {activeTab === "signup" && (
                <>
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Business Name */}
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      type="text"
                      placeholder="Your Business"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input id="whatsapp" type="tel" placeholder="+1234567890" />
                  </div>

                  {/* Store URL */}
                  <div className="space-y-2">
                    <Label htmlFor="store-url">Store URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        convoretail.com/
                      </span>
                      <Input
                        id="store-url"
                        type="text"
                        placeholder="yourstore"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Store Location */}
                  <div className="space-y-2">
                    <Label>Store Location</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="e.g., Nigeria" />
                      <Input placeholder="e.g., Lagos" />
                      <Input placeholder="e.g., Ikeja" />
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Country</span>
                      <span>State/Province</span>
                      <span>City</span>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {activeTab === "signup" ? "Create Store" : "Sign In"}
              </Button>
            </form>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Signup;
