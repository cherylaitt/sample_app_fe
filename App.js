import React, { useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet, Text, View, Linking, Button, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useCheckout } from "./preface/orders/hooks/useCheckout";

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: parseInt("0", 10),
      },
    },
  });

  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <StripeProvider
        merchantIdentifier={process.env.EXPO_PUBLIC_STRIPE_APPLE_MERCHANT_ID}
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      >
        <Home />
      </StripeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
});

function Home() {
  const { mutateAsync: checkoutMutation } = useCheckout();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const onCheckout = async () => {
    const payload = {
      amount: 10000,
      email: "cheryl.lai@preface.ai",
    };

    const checkoutResponse = await checkoutMutation({ fields: payload });

    const data = checkoutResponse;

    const {
      customer,
      ephemeral_key: ephemeralKey,
      payment_intent: paymentIntent,
    } = data;
    console.log(customer, ephemeralKey, paymentIntent);

    // stripe payment logic
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Preface Technopreneur Ltd.",
      customerId: customer?.id,
      customerEphemeralKeySecret: ephemeralKey?.secret,
      paymentIntentClientSecret: paymentIntent?.client_secret,
      returnURL: "preface-app://orderStatus?access_token=1234",
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {},
      appearance: {
        colors: {
          primary: "#000000",
        },
      },
      googlePay: {
        merchantCountryCode: "HK",
        testEnv: true,
        currencyCode: "HKD",
      },
    });

    console.log("Payment sheet initialized");

    const { error: presentPaymentSheetError } = await presentPaymentSheet();

    if (presentPaymentSheetError) {
      if (presentPaymentSheetError.code === "Canceled") return;
      Alert.alert("Error", error.message || presentPaymentSheetError.message);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
      console.log("Payment sheet presented");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff" }}>
        Open up App.js to start working on your app!
      </Text>
      <Button title="Press me" onPress={() => onCheckout()} />
      <StatusBar style="auto" />
    </View>
  );
}
