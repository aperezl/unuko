import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { marked } from "marked";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

// Generates static paths for all documentation files (optional, but good for build performance)
export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), "content", "docs");
  if (!fs.existsSync(docsDir)) return [];
  
  const files = fs.readdirSync(docsDir);
  return files
    .filter(file => file.endsWith(".md"))
    .map(file => ({
      slug: [file.replace(".md", "")],
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const docSlug = slug && slug.length > 0 ? slug[0] : "introduccion";
  
  // Title mapping for better SEO
  const titleMap: Record<string, string> = {
    "introduccion": "Introducción a ToolKit",
    "requisitos": "Requisitos del Sistema",
    "despliegue-cli": "Despliegue con unuko CLI",
    "alta-dispositivo": "Alta de Dispositivo",
    "gsma-standards": "Estándares GSMA SGP.22/32",
    "flujo-rsp": "Flujo de Aprovisionamiento",
    "softhsm-pkcs11": "SoftHSM y PKCS#11",
    "curvas-elipticas": "Curva Elíptica secp256r1",
    "ueransim-esim": "UERANSIM y eSIM",
    "enrutamiento-nat": "Rutas y Enrutamiento NAT",
    "api-endpoints": "Endpoints de Orquestación",
    "auditor-ia": "Auditoría de Logs con IA",
  };

  const displayName = titleMap[docSlug] || "Documentación";
  return {
    title: `${displayName} — Unuko ToolKit Docs`,
    description: `Aprende sobre ${displayName.toLowerCase()} en el laboratorio de pruebas eSIM 5G de Unuko ToolKit.`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const docSlug = slug && slug.length > 0 ? slug[0] : "introduccion";
  
  const filePath = path.join(process.cwd(), "content", "docs", `${docSlug}.md`);
  
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const rawContent = fs.readFileSync(filePath, "utf8");
  const htmlContent = await marked.parse(rawContent);

  return (
    <div className="py-6 prose max-w-none">
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
}
