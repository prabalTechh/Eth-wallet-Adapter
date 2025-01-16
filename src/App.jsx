/* eslint-disable no-undef */
import { useConnect, useSendTransaction } from "wagmi";
import { parseEther } from "viem"; // Ensure correct Ether parsing
import { useState, useEffect } from "react";
import Exchange from "./svg/Exchange";
import { ModeToggle } from "./components/ui/mode-toggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
// import dotenv from "dotenv";
// dotenv.config();

const WalletOptions = () => {
  const { connectors, connect } = useConnect();

  return (
    <div className="flex gap-4 flex-wrap">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          variant="outline"
          className="font-medium"
        >
          {connector.name}
        </Button>
      ))}
    </div>
  );
};

const App = () => {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    address: "",
    ethAmount: "",
    usdValue: "",
  });

  const { sendTransaction } = useSendTransaction(); // Hook to send transactions

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          ` https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&api_key=${import.meta.env.API_Key}`
        );
        const data = await response.json();
        setExchangeRate(data.ethereum.usd);
      } catch (error) {
        console.error("Failed to fetch price:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      let updatedData = { ...prev, [field]: value };

      if (!exchangeRate) return updatedData;

      // Automatically calculate USD value if ETH is updated
      if (field === "ethAmount") {
        const ethValue = parseFloat(value) || 0;
        updatedData.usdValue = (ethValue * exchangeRate).toFixed(2);
      }

      // Automatically calculate ETH value if USD is updated
      if (field === "usdValue") {
        const usdValue = parseFloat(value) || 0;
        updatedData.ethAmount = (usdValue / exchangeRate).toFixed(6);
      }

      return updatedData;
    });
  };

  const handleSend = async () => {
    if (!formData.address || !formData.ethAmount) {
      alert("Please enter both address and amount.");
      return;
    }

    try {
      const tx = await sendTransaction({
        to: formData.address,
        value: parseEther(formData.ethAmount), // Parse ETH amount to Wei
      });

      console.log(`Transaction Hash: ${tx}`);
      alert(`Transaction sent! Hash: ${tx}`);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl space-y-6">
          {/* Wallet Connection Section */}
          <Card>
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <WalletOptions />
            </CardContent>
          </Card>

          {/* Exchange Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Exchange
                {loading ? (
                  <span className="text-sm text-muted-foreground">
                    Loading rate...
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    1 ETH = ${exchangeRate?.toFixed(2) || "N/A"}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ShadcnInput
                placeholder="Enter the Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />

              <ShadcnInput
                placeholder="Amount in ETH"
                value={formData.ethAmount}
                onChange={(e) => handleInputChange("ethAmount", e.target.value)}
                type="number"
                step="0.01"
                min="0"
                disabled={loading}
              />

              <div className="flex items-center justify-center py-2 text-muted-foreground">
                <Exchange />
              </div>

              <ShadcnInput
                placeholder="Value in USD"
                value={formData.usdValue}
                onChange={(e) => handleInputChange("usdValue", e.target.value)}
                type="number"
                step="0.01"
                min="0"
                disabled={loading}
              />

              <Button
                onClick={handleSend}
                className="w-full"
                disabled={!formData.address || !formData.ethAmount || loading}
              >
                Send {formData.ethAmount || "0"} ETH ($
                {formData.usdValue || "0"})
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default App;
