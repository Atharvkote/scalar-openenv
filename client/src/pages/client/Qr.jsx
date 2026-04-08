import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  QrCode,
  Camera,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Utensils,
  MapPin,
  ArrowRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";
import axios from "axios";
import { useAuth } from "@/store/auth";
import { Helmet } from "react-helmet";

export default function QRScanner() {
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [tableNumber, setTableNumber] = useState(null);
  const { isLoggedIn, API, user, isSessionActive, setTableNo, tableNo: fromAuthTableNo } = useAuth();

  const navigate = useNavigate();

  const handleScan = async (data) => {
    if (data?.text || typeof data === "string") {
      const qrText = data.text || data;
      setScannedData(qrText);
      setIsProcessing(true);
      setIsScanning(false);

      try {
        // ✅ Parse URL from QR code
        const url = new URL(qrText);
        const pathParts = url.pathname.split("/");
        const tableIndex = pathParts.findIndex((part) => part === "table");
        const tableNo =
          tableIndex !== -1 && pathParts[tableIndex + 1]
            ? pathParts[tableIndex + 1]
            : null;

        if (!tableNo) throw new Error("Table number not found in QR code.");

        console.log("Extracted Table No:", tableNo);

        if (!user?._id) {
          throw new Error("User not logged in. Please login to join session.");
        }

        const response = await axios.post(
          `${API}/api/order/join-session`,
          {
            tableNo,
            userId: user._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log('API DONE');
        if (response.status === 200) {
          console.log(`Response: `, response.data.message)
          toast.success(
            response.data.message || `Table ${tableNo} joined successfully!`
          );
          setTableNumber(tableNo);
          setTableNo(tableNo);
          navigate("/menu");
        }
      } catch (error) {
        console.error("QR Handling Error:", error);

        // Show API error message if available
        const errMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while joining the session.";

        toast.error(errMessage);
        console.log(errMessage)
        // 👉 403 means “table engaged by someone else”
        if (error?.response?.status === 403) {
          // maybe redirect back or let user try another table
          setIsScanning(true);
        }
        setScannedData(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleError = (err) => {
    console.error("Camera error:", err);
    setError("Unable to access camera. Please allow permission.");
    setIsScanning(false);
  };

  const startScanning = () => {
    setIsScanning(true);
    setError(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScannedData(null);
    setTableNumber(null);
    setIsProcessing(false);
    setError(null);
    setIsScanning(true);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth/login");
    }
    if (isSessionActive || fromAuthTableNo) {
      navigate("/menu");
    }
  }, [isLoggedIn, isSessionActive, navigate, fromAuthTableNo]);

  return (
    <div className="min-h-screen bg-[#fff9f1] p-4">
      <Helmet>
        <title>FOOD DASH | SCAN QR</title>
        <meta name="description" content="Live updates on table orders and reservations." />
      </Helmet>
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#ff8904] to-[#7e2a0c] flex items-center justify-center shadow-[8px_8px_16px_#e6ddd4,-8px_-8px_16px_#ffffff]">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#7e2a0c] mb-2">
            Scan Table QR
          </h1>
          <p className="text-gray-600">
            Point your camera at the QR code on your table
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Success State */}
          {tableNumber && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-[12px_12px_24px_#e6ddd4,-12px_-12px_24px_#ffffff]">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#7e2a0c] mb-2">
                    Table Found!
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <MapPin className="w-5 h-5 text-[#ff8904]" />
                    <Badge className="bg-[#ff8904] text-white text-lg px-4 py-2">
                      Table {tableNumber}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-6">Redirecting to menu...</p>
                  <div className="flex items-center justify-center gap-2">
                    <Utensils className="w-4 h-4 text-[#ff8904]" />
                    <ArrowRight className="w-4 h-4 text-[#ff8904] animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Camera Error:</strong> {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Scanner State */}
          {!error && !tableNumber && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-[12px_12px_24px_#e6ddd4,-12px_-12px_24px_#ffffff] overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-[#7e2a0c] flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" />
                    Camera Scanner
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  {!isScanning ? (
                    <div className="p-8 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#ff8904]/20 to-[#7e2a0c]/20 flex items-center justify-center shadow-[inset_4px_4px_8px_#e6ddd4,inset_-4px_-4px_8px_#ffffff]">
                        <QrCode className="w-12 h-12 text-[#ff8904]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#7e2a0c] mb-2">
                        Ready to Scan
                      </h3>
                      <p className="text-gray-600 mb-6 text-sm">
                        Position the QR code within the camera frame
                      </p>
                      <Button
                        onClick={startScanning}
                        className="w-full bg-[#ff8904] hover:bg-[#e67a03] text-white py-3"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start Scanning
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="aspect-square rounded-b-2xl overflow-hidden">
                        <QrScanner
                          delay={300}
                          onError={handleError}
                          onScan={handleScan}
                          style={{ width: "100%" }}
                        />
                      </div>

                      {/* Controls */}
                      <div className="p-4 flex gap-3">
                        <Button
                          variant="outline"
                          onClick={stopScanning}
                          className="flex-1 bg-white border-0 shadow-[4px_4px_8px_#e6ddd4,-4px_-4px_8px_#ffffff]"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={resetScanner}
                          className="flex-1 bg-[#7e2a0c] hover:bg-[#6b2409] text-white"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {!tableNumber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-[4px_4px_8px_#e6ddd4,-4px_-4px_8px_#ffffff]">
              <CardContent className="p-4">
                <h3 className="font-semibold text-[#7e2a0c] mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Tips for Better Scanning
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff8904] rounded-full mt-2 flex-shrink-0"></span>
                    Hold your device steady and ensure good lighting
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff8904] rounded-full mt-2 flex-shrink-0"></span>
                    Keep the QR code within the scanning frame
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff8904] rounded-full mt-2 flex-shrink-0"></span>
                    Make sure the QR code is clean and not damaged
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
