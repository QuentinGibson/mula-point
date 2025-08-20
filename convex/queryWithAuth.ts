import { ObjectType, PropertyValidators } from "convex/values";
import { query, QueryCtx } from "./_generated/server";

export function queryWithAuth<
  ArgsValidator extends PropertyValidators,
  Output
>({
  args,
  handler,
}: {
  args: ArgsValidator;
  handler: (
    ctx: QueryCtx,
    args: ObjectType<ArgsValidator>
  ) => Output;
}) {
  return query({
    args: {
      ...args,
    },
    handler: async (ctx, args: any) => {
      // Check if user is logged in
      const identifier = await ctx.auth.getUserIdentity()

      // Otherwise throw
      if (!identifier) {
        throw new Error("User is not authenticated")
      }

      // Check if user is in system
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", q => q.eq("tokenIdentifier", identifier.tokenIdentifier))
        .unique()

      // Otherwise throw
      if (!user) {
        throw new Error("User does not exist!")
      }

      return handler({ ...ctx }, args);
    },
  });
}
