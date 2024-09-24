"use client";

import { post } from "../../../helpers/api";

export async function checkout(fields) {
  console.log("checkout", fields);

  return post("checkout", fields, { ignoreAuthorization: false });
}
