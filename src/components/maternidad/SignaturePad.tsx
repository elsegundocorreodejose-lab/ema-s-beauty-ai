import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Signature } from "@/lib/maternidad/types";

interface SignaturePadProps {
  onSign: (signature: Signature) => void;
  defaultName?: string;
  disabled?: boolean;
  label?: string;
}

export function SignaturePad({ onSign, defaultName = "", disabled, label = "Firma de conformidad" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signerName, setSignerName] = useState(defaultName);
  const [drawing, setDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d");

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    setDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    ctx.beginPath();
    ctx.moveTo(point.clientX - rect.left, point.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || disabled) return;
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    ctx.lineTo(point.clientX - rect.left, point.clientY - rect.top);
    ctx.strokeStyle = "#1a365d";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasStroke(true);
  };

  const endDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signerName.trim() || !hasStroke) return;
    onSign({
      signatureData: canvas.toDataURL(),
      signerName: signerName.trim(),
      timestamp: new Date().toISOString(),
    });
    clear();
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <h4 className="font-semibold">{label}</h4>
      <div className="space-y-2">
        <Label htmlFor="signer-name">Nombre del firmante</Label>
        <Input
          id="signer-name"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Nombre completo"
          disabled={disabled}
        />
      </div>
      <div className="overflow-hidden rounded-md border border-dashed border-border bg-muted/20">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <p className="text-xs text-muted-foreground">Dibuje su firma en el recuadro superior.</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear} disabled={disabled}>
          Limpiar
        </Button>
        <Button type="button" size="sm" onClick={handleSign} disabled={disabled || !hasStroke || !signerName.trim()}>
          Confirmar firma
        </Button>
      </div>
    </div>
  );
}

export function SignatureDisplay({ signature, label }: { signature: Signature; label?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      {label && <p className="mb-2 text-sm font-medium">{label}</p>}
      {signature.signatureData.startsWith("data:") ? (
        <img src={signature.signatureData} alt="Firma" className="mb-2 h-16 object-contain" />
      ) : (
        <p className="mb-2 text-sm italic text-muted-foreground">Firma registrada</p>
      )}
      <p className="text-sm font-medium">{signature.signerName}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(signature.timestamp).toLocaleString("es-AR")}
      </p>
    </div>
  );
}
