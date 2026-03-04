import React, { useState, useRef, useEffect } from "react";
import AppNav from "@/components/AppNav";
import { Shop } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Upload, X, Loader2 } from "lucide-react";

const ShopSetup: React.FC = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop>({
    shop_name: "Fresh Fish Market",
    shop_name_tamil: "புதிய மீன் சந்தை",
    tagline: "Daily Fresh Catch",
    logo_url: "",
    phone: "",
    address: "",
    delivery_note: "Free delivery above ₹500",
    owner_email: "",
  });
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setShopId(data.id);
        setShop({
          shop_name: data.shop_name,
          shop_name_tamil: data.shop_name_tamil || "",
          tagline: data.tagline || "",
          logo_url: data.logo_url || "",
          phone: data.phone || "",
          address: data.address || "",
          delivery_note: data.delivery_note || "",
          owner_email: user.email || "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const update = (field: keyof Shop, value: string) => {
    setShop(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      shop_name: shop.shop_name,
      shop_name_tamil: shop.shop_name_tamil,
      tagline: shop.tagline,
      logo_url: shop.logo_url,
      phone: shop.phone,
      address: shop.address,
      delivery_note: shop.delivery_note,
    };

    if (shopId) {
      await supabase.from("shops").update(payload).eq("id", shopId);
    } else {
      const { data } = await supabase.from("shops").insert(payload).select("id").single();
      if (data) setShopId(data.id);
    }
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
  ];

  if (loading) return (
    <div className="min-h-screen p-4 md:p-6 max-w-2xl mx-auto">
      <AppNav />
      <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
    </div>
  );

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
