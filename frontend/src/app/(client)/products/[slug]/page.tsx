// app/products/[slug]/page.tsx
import axios from "axios";
import { notFound } from "next/navigation";
import { SERVER_URL } from "@/constant";
import ProductDetail from "@/components/client/Productdetail";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>; // Next 15+. On Next 14 use { params: { slug: string } } without await
}) {
  const { slug } = await params;

  let product = null;
  try {
    const { data: json } = await axios.get(`${SERVER_URL}/product/1/1`, {
      params: { slug, isActive: true },
    });
    // backend: [] when empty, otherwise { data: { data: [...] } }
    const list = Array.isArray(json?.data) ? json.data : (json?.data?.data ?? []);
    product = list[0] ?? null;
  } catch {
    product = null;
  }

  if (!product) notFound();
  return <ProductDetail key={product._id} product={product} />;
}