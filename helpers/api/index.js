import { ApiError } from "./ApiError";

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function post(
  path,
  data,
  { ignoreAuthorization = false, onResponseHeader }
) {
  console.log("API post", path, data);

  const response = await callFetch(path, {
    method: "POST",
    body: JSON.stringify(data),
    ignoreAuthorization,
  });

  if (!response.ok) {
    return handleError(response);
  }

  if (onResponseHeader) {
    await onResponseHeader(response.headers);
  }

  // 204 No Content - return nothing.
  if (response.status === 204) {
    return null;
  }

  const parsedResponse = await response.json();

  return parsedResponse;
}

async function callFetch(
  resource,
  { ignoreAuthorization = false, ...options }
) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
  };

  console.log("API call", `${apiBaseUrl}/${resource}`, options);

  return fetch(`${apiBaseUrl}/${resource}`, {
    ...options,
    credentials: "same-origin",
    headers,
  });
}

export function getParams(params) {
  const filteredParams = [];

  if (!params) {
    return "";
  }

  for (const key in params) {
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== ""
    ) {
      if (Array.isArray(params[key])) {
        params[key].forEach((value) => {
          filteredParams.push([`${key}[]`, value]);
        });
      } else {
        filteredParams.push([key, params[key]]);
      }
    }
  }

  const search = new URLSearchParams(filteredParams).toString();

  return search ? `?${search}` : "";
}

async function handleError(response) {
  if (!response.ok) {
    console.log("API non-success response", response.status);

    const isContentTypeJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    const responseJson = isContentTypeJson ? await response.json() : null;

    if (responseJson) {
      const {
        data: { code, errors, message },
      } = responseJson;

      const status = response.status;

      const error = new ApiError({
        url: response.url,
        status,
        code,
        errors,
        message: message,
      });

      if (error.unauthorized()) {
        onUnauthorized();
      }

      throw error;
    }
  }
}
