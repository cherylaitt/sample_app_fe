const errorCodeMapping = {
  400: {
    any: () => "Bad Request",
  },
  422: {
    query_parameter_invalid: () => undefined,
  },
  404: {
    any: () => "Resources Not Found",
  },
  any: {
    any: () => "An Error Occur.",
  },
};

export function composeErrorMessage(status, code, message) {
  const statusSubtree = errorCodeMapping[status] || errorCodeMapping.any;

  const errorMessage = statusSubtree[code]
    ? statusSubtree[code]()
    : message || statusSubtree.any;

  return errorMessage;
}
