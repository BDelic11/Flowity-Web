"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  trigger,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {trigger && (
        <DialogTrigger asChild>
          <Button>Open Modal</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-lg">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="mt-4">{children}</div>
        <DialogClose>
          <Button onClick={onClose}>Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
