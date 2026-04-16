import React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, CreditCard, Download } from "lucide-react";

const PaymentPage = () => {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    // UC 10.1: Card Type Detection
    if (cardNumber.startsWith("4")) {
      setCardType("Visa");
    } else if (cardNumber.startsWith("5")) {
      setCardType("Mastercard");
    } else {
      setCardType("");
    }
  }, [cardNumber]);

  const processPayment = (event) => {
    event.preventDefault();
    setIsProcessing(true);

    // Simulate API call for 2 seconds
    setTimeout(() => {
      setIsProcessing(false);
      setRecorded(true);
    }, 2000);
  };

  return (
    <div className="text-foreground mx-auto max-w-4xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background border-border rounded-lg border p-4">
              <p className="text-muted-foreground mb-2 text-sm">
                FitLink Pro Membership
              </p>
              <p className="text-primary text-2xl font-bold">$50.00/mo</p>
            </div>
            <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
              <li>• Personalized Workout Plans</li>
              <li>• Direct Coach Messaging</li>
              <li>• Advanced Analytics & Progress Tracking</li>
            </ul>
          </CardContent>
        </Card>

        {/* Payment Portal */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="text-primary h-5 w-5" />
              Payment Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recorded ? (
              <div className="space-y-4 py-6 text-center">
                <div className="text-primary text-xl font-bold">
                  Payment Successful!
                </div>
                <p className="text-muted-foreground text-sm">
                  Transaction #FIT-{Math.floor(Math.random() * 10000)} has been
                  recorded.
                </p>
                {/* UC 10.2: Invoice Generation */}
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-center gap-2"
                  onClick={() => alert("Downloading Invoice INV-2026-001...")}
                >
                  <Download className="h-4 w-4" /> Download Invoice
                </Button>
              </div>
            ) : (
              <form onSubmit={processPayment} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Name on Card
                  </label>
                  <input
                    className="border-input bg-background focus:ring-primary
                      flex h-10 w-full rounded-md border px-3 py-2 text-sm
                      focus:ring-2 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Card Number Field */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      className="border-input bg-background focus:ring-primary
                        flex h-10 w-full rounded-md border px-3 py-2 pr-16
                        text-sm focus:ring-2 focus:outline-none"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 1111 1111 1111"
                      maxLength={16}
                      required
                    />
                    {cardType && (
                      <span
                        className="bg-primary absolute top-1/2 right-2
                          -translate-y-1/2 rounded px-2 py-0.5 text-[10px]
                          font-bold text-white uppercase"
                      >
                        {cardType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Expiry
                    </label>
                    <input
                      className="border-input bg-background focus:ring-primary
                        flex h-10 w-full rounded-md border px-3 py-2 text-sm
                        focus:ring-2 focus:outline-none"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      CVV
                    </label>
                    <input
                      className="border-input bg-background focus:ring-primary
                        flex h-10 w-full rounded-md border px-3 py-2 text-sm
                        focus:ring-2 focus:outline-none"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primary/90 mt-2 w-full
                    text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm & Pay"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
