import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Loader2,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Users,
} from "lucide-react";
import usePostToAPI from "@/hooks/usePostToAPI";

const PaymentPage = () => {
  const {
    postFunction,
    loading: cardSubmitLoading,
    error: cardSubmitError,
  } = usePostToAPI();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("");
  const [requiredLength, setRequiredLength] = useState(16);
  const [ccvRequiredLength, setCCVRequiredLength] = useState(3);

  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  const [recorded, setRecorded] = useState(false);
  const [luhnError, setLuhnError] = useState("");

  const isValidLuhn = (cardNumber) => {
    let checksum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let val = Number(cardNumber[i]) * (shouldDouble ? 2 : 1);

      if (val >= 10) {
        checksum += Math.floor(val / 10) + (val % 10);
      } else {
        checksum += val;
      }
      shouldDouble = !shouldDouble;
    }
    return checksum % 10 === 0;
  };

  const paymentPayload = () => {
    const [month, year] = expiry.split("/");

    return {
      card_number: cardNumber,
      card_exp_month: month || "",
      card_exp_year: year || "",
      card_security_number: cvv,
      card_name: name,
      card_address: address,
      card_address_2: address2 || null,
      card_city: city,
      card_postcode: postcode,
    };
  };

  useEffect(() => {
    if (/^4/.test(cardNumber)) {
      setCardType("Visa");
      setRequiredLength(16);
      setCCVRequiredLength(3);
    } else if (/^3[47]/.test(cardNumber)) {
      setCardType("Amex");
      setRequiredLength(15);
      setCCVRequiredLength(4);
    } else if (/^(6011|65|64[4-9])/.test(cardNumber)) {
      setCardType("Discover");
      setRequiredLength(16);
      setCCVRequiredLength(3);
    } else if (
      /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[10]\d|2720)/.test(cardNumber)
    ) {
      setCardType("Mastercard");
      setRequiredLength(16);
      setCCVRequiredLength(3);
    } else {
      setCardType("");
      setRequiredLength(16);
      setCCVRequiredLength(3);
    }
    setLuhnError("");
  }, [cardNumber]);

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiry(value);
  };

  const handleProcessPayment = async (event) => {
    event.preventDefault();

    if (!isValidLuhn(cardNumber)) {
      setLuhnError("Invalid card number. Please check for typos.");
      return;
    }

    console.log("Payload ready for backend:", paymentPayload());

    setTimeout(() => {
      setRecorded(true);
    }, 2000);

    // try {
    //   await postFunction(`/users/payment`, paymentPayload());
    //   setRecorded(true)
    // } catch (err) {
    //   console.error("Failed to submit payment method.", err);
    // }
  };

  return (
    <div className="text-foreground mx-auto max-w-4xl px-4 py-8">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Order Summary */}
        <Card className="bg-card border-border flex flex-col !pt-4">
          <CardHeader>
            <CardTitle className="text-lg">Wallet Information</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="bg-background border-border rounded-lg border p-4">
              <p className="text-muted-foreground mb-2 text-sm">
                Coach Hiring Profile
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary h-6 w-6" />
                <p className="text-primary text-xl font-bold">
                  Secure Card on File
                </p>
              </div>
            </div>
            <ul
              className="text-muted-foreground 4 mt-6 ml-6 list-disc space-y-3
                text-sm"
            >
              <li>Save a payment method to unlock coach requests.</li>
              <li>
                You will <strong>not</strong> be charged until a coach
                officially accepts your request.
              </li>
              <li>
                Manage your billing securely in one place without re-entering
                data for every coach.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Payment Portal */}
        <Card className="bg-card border-border flex flex-col !pt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="text-primary h-5 w-5" />
              Payment Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col">
            {recorded ? (
              <div
                className="flex flex-grow flex-col items-center justify-center
                  space-y-6 py-12 text-center"
              >
                <div className="space-y-2">
                  <div className="text-primary text-xl font-bold">
                    Wallet Ready!
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your payment method is linked. You can now request coaches
                    from the dashboard.
                  </p>
                </div>
                <Button
                  variant="default"
                  className="flex w-full max-w-[250px] items-center
                    justify-center gap-2"
                  onClick={() => navigate("/coaches/browse")}
                >
                  <Users className="h-4 w-4" /> Browse Coaches
                </Button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {/* Name Field */}
                <div
                  className="text-muted-foreground text-md mt-2 border-b pb-1
                    font-bold"
                >
                  Card Details
                </div>
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
                      className={`bg-background focus:ring-primary flex h-10
                        w-full rounded-md border px-3 py-2 pr-16 text-sm
                        focus:ring-2 focus:outline-none
                        ${luhnError ? "border-destructive" : ""}`}
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="4111 1111 1111 1111"
                      maxLength={requiredLength}
                      minLength={requiredLength}
                      type="text"
                      inputMode="numeric"
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
                  {luhnError && (
                    <p className="text-destructive mt-1 text-xs">{luhnError}</p>
                  )}
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
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      minLength={5}
                      inputMode="numeric"
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
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="123"
                      maxLength={ccvRequiredLength}
                      minLength={ccvRequiredLength}
                      type="text"
                      inputMode="number"
                      required
                    />
                  </div>
                </div>

                <div
                  className="text-muted-foreground text-md mt-2 border-b pb-1
                    font-bold"
                >
                  Billing Address
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Street Address
                  </label>
                  <input
                    className="border-input bg-background focus:ring-primary
                      flex h-10 w-full rounded-md border px-3 py-2 text-sm
                      focus:ring-2 focus:outline-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="101 Bleeker St"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Address 2 (Optional)
                  </label>
                  <input
                    className="border-input bg-background focus:ring-primary
                      flex h-10 w-full rounded-md border px-3 py-2 text-sm
                      focus:ring-2 focus:outline-none"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Apt, Suite, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      City
                    </label>
                    <input
                      className="border-input bg-background focus:ring-primary
                        flex h-10 w-full rounded-md border px-3 py-2 text-sm
                        focus:ring-2 focus:outline-none"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Newark"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      ZIP
                    </label>
                    <input
                      className="border-input bg-background focus:ring-primary
                        flex h-10 w-full rounded-md border px-3 py-2 text-sm
                        focus:ring-2 focus:outline-none"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="07103"
                      required
                    />
                  </div>
                </div>

                {cardSubmitError && (
                  <div
                    className="bg-destructive/15 text-destructive flex
                      items-center gap-2 rounded-md p-3 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <p>
                      {cardSubmitError?.message || "Payment submission failed."}
                    </p>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={cardSubmitLoading}
                  className="bg-primary hover:bg-primary/90 mt-2 w-full
                    hover:cursor-pointer"
                >
                  {cardSubmitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Payment Method"
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
