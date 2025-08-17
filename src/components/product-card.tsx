"use client";

import type { Product } from "@/types";
import Image from "next/image";
import { useState } from "react";
import {
  Heart,
  Bookmark,
  MessageSquare,
  Share2,
  Copy,
  Mail,
  MoreHorizontal,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function ProductCard({ product }: { product: Product }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://linkshare-app.com/product/${product.id}`);
    toast({
      title: "Link Copied!",
      description: "Product link has been copied to your clipboard.",
    });
  };
  
  const handleBuyNow = () => {
    if (product.buyUrl) {
      window.open(product.buyUrl, "_blank", "noopener,noreferrer");
    } else {
      setIsBuyModalOpen(true);
    }
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(product.price);

  return (
    <>
      <Card className="flex flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
        <CardHeader className="relative p-0 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={600}
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint={product.dataAiHint}
          />
        </CardHeader>
        <CardContent className="flex-grow p-5">
          <CardTitle className="font-bold text-lg leading-tight">{product.name}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-5 pt-0">
            <div className="flex w-full items-center justify-between mb-4">
                 <p className="text-xl font-bold text-foreground">{formattedPrice}</p>
                <div className="flex items-center gap-1 text-muted-foreground">
                <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    aria-label="Like"
                >
                    <Heart className={cn("h-5 w-5 transition-all", isLiked && "fill-destructive text-destructive")} />
                </button>
                <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    aria-label="Save"
                >
                    <Bookmark className={cn("h-5 w-5 transition-all", isBookmarked && "fill-primary text-primary")} />
                </button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleCopyLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <a href={`mailto:?subject=Check out this product!&body=I found this cool product on Flow v3: https://linkshare-app.com/product/${product.id}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Share via Email</span>
                        </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <a href={`sms:?&body=Check out this product on Flow v3: https://linkshare-app.com/product/${product.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Share via SMS</span>
                        </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
             <Button className="w-full font-semibold" size="lg" onClick={handleBuyNow}>
                <ShoppingBag className="mr-2"/>
                Buy Now
            </Button>
        </CardFooter>
      </Card>

      <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Purchase {product.name}</DialogTitle>
            <DialogDescription>
              Complete your purchase securely. Your item will be on its way soon!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Card Details</Label>
              <Input id="card" placeholder="Card Number" />
            </div>
             <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="MM/YY" />
               </div>
               <div className="space-y-2 col-span-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="CVC" />
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" size="lg" className="w-full" onClick={() => {
              setIsBuyModalOpen(false);
              toast({ title: "Purchase Successful!", description: `Thank you for buying the ${product.name}.` });
            }}>
              Pay {formattedPrice}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
