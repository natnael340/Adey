"use client";

import { PaypalOptionsType, PlanType } from "@/app/types/types";
import { PaypalOptions } from "@/app/constants/consts";
import React, { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  OnApproveBraintreeData,
  OnApproveBraintreeActions,
} from "@paypal/react-paypal-js";
import Api from "@/app/components/Api";

type ParamType = {
  data: PlanType;
  token: string;
  options: PaypalOptionsType;
};

const PaypalPayment = ({ data, token, options }: ParamType) => {
  const api = new Api(token);
  const [message, setMessage] = useState<string>("");

  const createSubscription = async () => {
    try {
      const order = await api.checkout(data.identifier);
      console.log(order);
      return order.id;
    } catch (error) {
      console.error(error);
    }
    return "";
  };
  const onApprove = async (data: any, action: any) => {
    if (data.subscriptionID) {
      try {
        console.log(data);
        const response = await api.check_status(data.subscriptionID);

        alert(response.error);
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Order not found");
    }
  };

  return (
    <div>
      <PayPalScriptProvider options={options}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
          }}
          className="w-60"
          createSubscription={createSubscription}
          onApprove={onApprove}
        ></PayPalButtons>
      </PayPalScriptProvider>
    </div>
  );
};

export default PaypalPayment;
