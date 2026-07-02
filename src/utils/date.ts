export const formatDateTime = (isoString: string) => {
  const match = isoString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);

  if (!match) {
    return "";
  }

  const [, datePart, timePart] = match;

  return `${datePart} ${timePart}`;
};
