import React, { useState, CSSProperties } from "react";
import NextImage, {
  ImageProps as NextImageProps,
  StaticImageData,
} from "next/image";
import { Loader, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageProps
  extends Omit<
    NextImageProps,
    "src" | "onLoadingComplete" | "onError" | "alt"
  > {
  src: string | StaticImageData;
  alt?: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: "empty" | "blur" | "data:image/..." | undefined;
  style?: CSSProperties;
  onLoadingComplete?: (result: {
    naturalWidth: number;
    naturalHeight: number;
  }) => void;
  onError?: (error: Error) => void;
  blurDataURL?: string;
  fill?: boolean;
}

export const Image = ({
  src,
  alt = "Image",
  className = "",
  containerClassName = "",
  width = 0,
  height = 0,
  sizes,
  quality,
  priority = false,
  placeholder = "empty",
  style,
  onLoadingComplete,
  onError,
  blurDataURL,
  fill = false,
  ...rest
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadingComplete = (result: {
    naturalWidth: number;
    naturalHeight: number;
  }) => {
    setIsLoading(false);
    if (onLoadingComplete) {
      onLoadingComplete(result);
    }
  };

  const handleError = (error: Error) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className={`relative ${containerClassName}`} style={style}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center rounded bg-gray-100">
          <Loader className="size-5 animate-spin text-blue-500" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center rounded bg-red-50">
          <div className="flex flex-col items-center">
            <AlertCircle className="size-5 text-red-500" />
          </div>
        </div>
      ) : (
        <NextImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          quality={quality}
          priority={priority}
          onLoadingComplete={handleLoadingComplete}
          onError={(event) => {
            // Create a synthetic error from the event
            const error = new Error("Image failed to load");
            handleError(error);
          }}
          blurDataURL={blurDataURL}
          fill={fill}
          className={cn(
            isLoading ? "opacity-0" : "opacity-100",
            "rounded transition-opacity duration-300",
            className,
          )}
          {...rest}
        />
      )}
    </div>
  );
};
