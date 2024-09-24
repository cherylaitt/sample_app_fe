import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { checkout } from "../apis/checkout";

export function useCheckout() {
  return useMutation({
    mutationFn: ({ fields }) => checkout(fields),
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      Alert.alert("Failed to place order.", error.message, [{ text: "OK" }]);
    },
  });
}
