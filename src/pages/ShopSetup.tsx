import React, { useState, useRef } from "react";
import AppNav from "@/components/AppNav";
import { getShop, saveShop, Shop } from "@/lib/shop";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Upload, X } from "lucide-react";

const ShopSetup: React.FC = () => {
  const [shop, setShop] = useState<Shop>(getShop());
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof Shop, value: string) => {
    setShop(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveShop(shop);
    toast.success("Shop details saved!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("logo_url", reader.result as string);
    reader.readAsDataURL(file);
  };

  const fields: { key: keyof Shop; label: string; placeholder: string }[] = [
    { key: "shop_name", label: "Shop Name (English)", placeholder: "Fresh Fish Market" },
    { key: "shop_name_tamil", label: "Shop Name (Tamil)", placeholder: "புதிய மீன் சந்தை" },
    { key: "tagline", label: "Tagline", placeholder: "Daily Fresh Catch" },
    { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
    { key: "address", label: "Address", placeholder: "123 Beach Road, Chennai" },
    { key: "delivery_note", label: "Delivery Note", placeholder: "Free delivery above ₹500" },
    { key: "owner_email", label: "Email", placeholder: "owner@example.com" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-2xl mx-auto">
      <AppNav />

      <div className="glass-panel-strong glow-border p-6 space-y-6">
        <h1 className="text-xl font-bold text-primary glow-text">Shop Setup</h1>
        <p className="text-sm text-muted-foreground">Configure your shop details. These appear on every card.</p>

        {/* Logo */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Shop Logo</Label>
          <div className="flex items-center gap-4">
            {shop.logo_url ? (
              <div className="relative">
                <img src={shop.logo_url} alt="logo" className="w-16 h-16 rounded-lg object-cover border border-border" />
                <button onClick={() => update("logo_url", "")}
                  className="absolute -top-2 -right-2 bg-destructive rounded-full p-0.5">
                  <X size={12} className="text-destructive-foreground" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
                <Upload size={20} />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button onClick={() => fileRef.current?.click()}
              className="glass-panel px-3 py-1.5 text-xs text-primary hover:bg-primary/10 transition-colors">
              Upload Logo
            </button>
          </div>
        </div>

        {/* Fields */}
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Input value={shop[key]} onChange={e => update(key, e.target.value)}
              placeholder={placeholder} className="bg-secondary border-border" />
          </div>
        ))}

        <button onClick={handleSave}
          className="w-full glass-panel glow-border py-3 flex items-center justify-center gap-2 text-primary font-semibold hover:bg-primary/10 transition-colors">
          <Save size={16} /> Save Shop Details
        </button>
      </div>
    </div>
  );
};

export default ShopSetup;
