import { useCallback, useEffect, useState } from "react";
import type { ProductData, ProductField } from "@/types/product";
import { storage, onStorageChanged, emptyProductData } from "@/storage";
import type { ActiveTabInfo } from "./useActiveTab";

export function useProductData(tab: ActiveTabInfo, remember: boolean) {
  const [data, setData] = useState<ProductData>(() => emptyProductData());

  useEffect(() => {
    let alive = true;
    void storage.getProductData().then((raw) => {
      if (!alive) return;
      const stored: ProductData = { ...emptyProductData(), ...raw };
      const sameSite = stored.hostname !== "" && stored.hostname === tab.hostname;
      const samePage = stored.url !== "" && stored.url === tab.url;

      if (samePage) {
        setData(stored);
      } else if (sameSite && remember) {
        const reset: ProductData = {
          ...stored,
          title: "",
          price: "",
          description: "",
          images: [],
          discount: "",
          url: tab.url,
          hostname: tab.hostname,
          importedAt: new Date().toISOString(),
        };
        setData(reset);
        void storage.setProductData(reset);
      } else {
        setData(emptyProductData());
      }
    });

    const unsubscribe = onStorageChanged((changes) => {
      if (changes.productData) {
        const next = changes.productData.newValue as ProductData;
        setData({ ...emptyProductData(), ...next });
      }
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [tab.hostname, tab.url, remember]);

  const setField = useCallback(
    (field: ProductField, value: ProductData[ProductField]) => {
      setData((prev) => {
        const next: ProductData = {
          ...prev,
          [field]: value,
          hostname: tab.hostname,
          url: prev.url || tab.url,
          importedAt: new Date().toISOString(),
        };
        void storage.setProductData(next);
        return next;
      });
    },
    [tab.hostname, tab.url],
  );

  const clear = useCallback(() => {
    setData(emptyProductData());
    void storage.clearProductData();
  }, []);

  return { data, setField, clear };
}
