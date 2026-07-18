import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().uuid(),
  deliveryMethod: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD')
});
