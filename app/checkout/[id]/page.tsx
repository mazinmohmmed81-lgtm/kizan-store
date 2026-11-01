import CheckoutClient from "./CheckoutClient";

export function generateStaticParams() {
  return [{ id: "dummy" }];
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}