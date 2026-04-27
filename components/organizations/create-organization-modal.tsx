"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const CreateOrganizationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [organizationData, setOrganizationData] = useState({
    name: "",
    industry: "",
    email: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrganizationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !organizationData.name ||
      !organizationData.industry ||
      !organizationData.email
    ) {
      toast.error("All fields are required.");
      return;
    }

    try {
      toast.success("Organization created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to create organization.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Create Organization</h3>
        <p className="text-sm text-gray-600">
          Fill in the details to create a new organization
        </p>

        <div>
          <Input
            name="name"
            value={organizationData.name}
            onChange={handleInputChange}
            placeholder="Organization Name"
            required
          />
        </div>

        <div>
          <Input
            name="industry"
            value={organizationData.industry}
            onChange={handleInputChange}
            placeholder="Industry"
            required
          />
        </div>

        <div>
          <Input
            name="email"
            value={organizationData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
        </div>

        <Button
          className="mt-4"
          onClick={handleSubmit}
          disabled={
            !organizationData.name ||
            !organizationData.industry ||
            !organizationData.email
          }
        >
          Create Organization
        </Button>
      </div>
    </Modal>
  );
};
