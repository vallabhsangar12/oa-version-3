"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Zap } from "lucide-react"

export default function UpgradePage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "Forever",
      description: "Perfect for getting started",
      features: [
        "1 interview per day",
        "Basic feedback",
        "Interview history",
        "Community support",
      ],
      cta: "Current Plan",
      highlight: false,
      disabled: true,
    },
    {
      name: "Basic",
      price: "$2",
      period: "/month",
      description: "For regular practice",
      features: [
        "10 interviews per day",
        "Advanced feedback",
        "Detailed analytics",
        "Email support",
        "Custom interview types",
        "Resume integration",
      ],
      cta: "Coming Soon",
      highlight: false,
      disabled: true,
    },
    {
      name: "Pro",
      price: "$10",
      period: "/year",
      description: "Ultimate interview prep",
      features: [
        "Unlimited interviews",
        "AI-powered insights",
        "Real-time emotion analysis",
        "Priority support",
        "Interview records",
        "Performance tracking",
        "Interview tips & tricks",
        "Monthly reports",
      ],
      cta: "Coming Soon",
      highlight: true,
      disabled: true,
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-foreground">Upgrade Your Plan</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the perfect plan for your interview preparation journey
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3 lg:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative ${plan.highlight ? "md:scale-105" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 text-sm font-semibold text-white">
                      <Zap className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <Card
                  className={`flex h-full flex-col border-2 p-8 transition-all duration-300 ${
                    plan.highlight
                      ? "border-purple-500 bg-gradient-to-br from-purple-50/5 to-blue-50/5"
                      : "border-border hover:border-purple-500/30"
                  }`}
                >
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <div className="mb-8 flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    disabled={plan.disabled}
                    className={`w-full py-2 font-semibold transition-all duration-300 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                        : plan.disabled
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "border border-border hover:bg-secondary"
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  {/* Coming Soon Notice */}
                  {plan.disabled && (
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      Payment integration coming soon
                    </p>
                  )}
                </Card>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 rounded-lg border border-border bg-card/50 p-8">
            <h2 className="mb-8 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>

            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  q: "Can I change my plan anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes, start with our Free plan and explore all features. Upgrade anytime to get more interviews per day.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "Payment options will be available soon. We'll accept credit cards, debit cards, and digital wallets.",
                },
                {
                  q: "Can I cancel my subscription?",
                  a: "Yes, you can cancel anytime from your billing settings. No long-term commitments required.",
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Have questions about our plans?{" "}
              <a href="/contact" className="font-semibold text-purple-600 hover:text-purple-700">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
