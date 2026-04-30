import { useQuery } from "@tanstack/react-query";
import { puppiesApi, type Puppy } from "@/lib/api";

export function usePuppies() {
  return useQuery<Puppy[]>({
    queryKey: ["puppies"],
    queryFn: () => puppiesApi.list(),
    staleTime: 30_000,
    retry: 2,
  });
}
