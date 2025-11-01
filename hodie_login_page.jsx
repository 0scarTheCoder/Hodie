import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";

export default function HodieLogin() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b1740] to-[#0d0925] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#221c57]/90 border-none text-white shadow-xl rounded-3xl p-6">
          <CardHeader className="text-center">
            <img
              src="/hodielabs_logo.svg"
              alt="Hodie Labs"
              className="mx-auto w-32 mb-2"
            />
            <CardTitle className="text-2xl font-semibold text-white">
              Welcome to Hodie Labs
            </CardTitle>
            <p className="text-sm text-gray-300 mt-1">
              Your personalised health and performance dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 mt-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-[#ff7a18] to-[#af002d] text-white font-medium py-2 rounded-xl hover:opacity-90 transition"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="flex justify-between items-center text-sm text-gray-300 mt-3">
                <a href="#" className="hover:underline">Forgot password?</a>
                <a href="#" className="hover:underline">Create account</a>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
