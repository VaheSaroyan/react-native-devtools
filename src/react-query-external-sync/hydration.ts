import type {
  DefaultError,
  Mutation,
  MutationOptions,
  Query,
  QueryClient,
  QueryFunction,
  QueryOptions,
} from "@tanstack/react-query";

import {
  DehydratedMutation,
  DehydratedQuery,
  DehydratedState,
  ObserverState,
} from "./types";
type TransformerFn = (data: unknown) => unknown;

export function Dehydrate(client: QueryClient): DehydratedState {
  const mutations = client
    .getMutationCache()
    .getAll()
    .flatMap((mutation) => [dehydrateMutation(mutation)]);

  const queries = client
    .getQueryCache()
    .getAll()
    .flatMap((query) => [dehydrateQuery(query)]);

  return { mutations, queries };
}
export interface DehydrateOptions {
  serializeData?: TransformerFn;
  shouldDehydrateMutation?: (mutation: Mutation) => boolean;
  shouldDehydrateQuery?: (query: Query) => boolean;
  shouldRedactErrors?: (error: unknown) => boolean;
}

export interface HydrateOptions {
  defaultOptions?: {
    deserializeData?: TransformerFn;
    queries?: QueryOptions;
    mutations?: MutationOptions<unknown, DefaultError, unknown, unknown>;
  };
}

function dehydrateMutation(mutation: Mutation): DehydratedMutation {
  return {
    mutationId: mutation.mutationId,
    mutationKey: mutation.options.mutationKey,
    state: mutation.state,
    ...(mutation.options.scope && { scope: mutation.options.scope }),
    ...(mutation.meta && { meta: mutation.meta }),
  };
}

function dehydrateQuery(query: Query): DehydratedQuery {
  // Extract observer states
  const observerStates: ObserverState[] = query.observers.map((observer) => ({
    queryHash: query.queryHash,
    options: observer.options,
    // Remove queryFn from observer options to prevent not being able to capture fetch action
    queryFn: undefined as unknown as QueryFunction,
  }));

  return {
    state: {
      ...query.state,
      ...(query.state.data !== undefined && {
        data: query.state.data,
      }),
    },
    queryKey: query.queryKey,
    queryHash: query.queryHash,
    ...(query.meta && { meta: query.meta }),
    observers: observerStates,
  };
}
