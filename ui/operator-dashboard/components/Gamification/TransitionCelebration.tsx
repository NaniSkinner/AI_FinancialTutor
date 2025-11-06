"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Modal, Badge, Button } from "@/components/Common";
import { CELEBRATIONS } from "./constants";
import { formatPersonaName } from "./utils";
import type { TransitionCelebrationProps, Celebration } from "./types";

export function TransitionCelebration({
  transition,
  onClose,
}: TransitionCelebrationProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Create celebration key from transition personas
  const celebrationKey =
    `${transition.fromPersona}_to_${transition.toPersona}` as keyof typeof CELEBRATIONS;

  // Get celebration config or use default
  const celebration: Celebration =
    CELEBRATIONS[celebrationKey] || CELEBRATIONS.default;

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    // Mark celebration as shown in localStorage to avoid showing again
    const celebrationId = `celebration_${transition.fromPersona}_to_${transition.toPersona}_${transition.transitionDate}`;
    localStorage.setItem(celebrationId, "shown");
  }, [transition]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      className="sm:max-w-md"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={`text-center space-y-4 py-8 px-4 bg-gradient-to-br ${celebration.color} bg-opacity-10 rounded-lg -mt-4 -mx-6`}
      >
        {/* Trophy Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.8,
            type: "spring",
            bounce: 0.5,
            delay: 0.2,
          }}
          className="text-6xl"
        >
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="inline-block"
          >
            🏆
          </motion.span>
        </motion.div>

        {/* Celebration Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl font-bold text-gray-900"
        >
          {celebration.title}
        </motion.h2>

        {/* Celebration Message */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-muted-foreground px-4 leading-relaxed"
        >
          {celebration.message}
        </motion.p>

        {/* Achievement Badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
          className="py-4"
        >
          <Badge
            variant="secondary"
            className="text-base px-4 py-2 bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            ✨ Achievement Unlocked: {celebration.achievement}
          </Badge>
        </motion.div>

        {/* Transition Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-gray-200 mt-4"
        >
          <p>
            <span className="font-medium">From:</span>{" "}
            <strong className="text-gray-700">
              {formatPersonaName(transition.fromPersona)}
            </strong>
          </p>
          <p>
            <span className="font-medium">To:</span>{" "}
            <strong className="text-gray-700">
              {formatPersonaName(transition.toPersona)}
            </strong>
          </p>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Button onClick={handleClose} className="mt-6 w-full">
            Continue Learning
          </Button>
        </motion.div>
      </motion.div>
    </Modal>
  );
}
