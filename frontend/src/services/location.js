import api from "./api";

export const searchLocations = async (query) => {
  const response = await api.get(
    `/search-location?q=${encodeURIComponent(query)}`
  );

  return response.data;
};