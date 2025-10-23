declare module "react-signature-canvas" {
  import * as React from "react";

  export interface SignatureCanvasProps {
    penColor?: string;
    backgroundColor?: string;
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  }

  export interface SignatureCanvasRef {
    clear(): void;
    isEmpty(): boolean;
    getTrimmedCanvas(): HTMLCanvasElement;
    getCanvas(): HTMLCanvasElement;
    fromDataURL(base64String: string): void;
  }

  export default class SignatureCanvas extends React.Component<
    SignatureCanvasProps
  > {
    clear(): void;
    isEmpty(): boolean;
    getTrimmedCanvas(): HTMLCanvasElement;
    getCanvas(): HTMLCanvasElement;
    fromDataURL(base64String: string): void;
  }
}
