// Validation for combo (bundle) data coming from the admin form.

import mongoose from 'mongoose';
import Bundle from '@/models/Bundle';
import Product from '@/models/Product';

const clip = (value, max) => String(value ?? '').trim().slice(0, max);

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'combo';
}

// Unique slug from the title; keeps the current slug when editing the same combo.
async function uniqueSlug(title, excludeId) {
  const base = slugify(title);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const taken = await Bundle.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) });
    if (!taken) return slug;
  }
  throw new Error('Could not create a unique link for this combo, try another title');
}

function parseDate(value, label) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is not a valid date`);
  return date;
}

// Turns the request body into clean bundle fields, or throws an Error whose
// message is safe to show the admin.
export async function normalizeBundleData(body, excludeId) {
  const title = clip(body.title, 200);
  if (!title) throw new Error('Please give the combo a title');

  if (!mongoose.isValidObjectId(body.tshirt)) throw new Error('Please select a T-shirt');
  if (!mongoose.isValidObjectId(body.trouser)) throw new Error('Please select a trouser');

  const [tshirt, trouser] = await Promise.all([
    Product.findById(body.tshirt).select('name garmentType sizes').lean(),
    Product.findById(body.trouser).select('name garmentType sizes').lean(),
  ]);
  // Products saved before garmentType existed are T-shirts.
  if (!tshirt || (tshirt.garmentType && tshirt.garmentType !== 'tshirt')) throw new Error('Selected T-shirt was not found');
  if (!trouser || trouser.garmentType !== 'trouser') throw new Error('Selected trouser was not found');

  const tshirtSizes = (tshirt.sizes || []).map((s) => s.size);
  const trouserSizes = (trouser.sizes || []).map((s) => s.size);

  const options = (Array.isArray(body.options) ? body.options : []).map((option, index) => {
    const n = index + 1;
    const tshirtSize = clip(option.tshirtSize, 30);
    const trouserSize = clip(option.trouserSize, 30);
    const price = Math.round(Number(option.price));
    if (!tshirtSizes.includes(tshirtSize)) throw new Error(`Option ${n}: pick a T-shirt size`);
    if (!trouserSizes.includes(trouserSize)) throw new Error(`Option ${n}: pick a trouser size`);
    if (!Number.isFinite(price) || price < 1) throw new Error(`Option ${n}: enter a combo price`);
    return {
      ...(mongoose.isValidObjectId(option._id) && { _id: option._id }),
      label: clip(option.label, 60) || `${tshirtSize} + ${trouserSize}`,
      tshirtSize,
      trouserSize,
      price,
    };
  });
  if (options.length === 0) throw new Error('Add at least one size option');

  const startsAt = parseDate(body.startsAt, 'Start date');
  const endsAt = parseDate(body.endsAt, 'End date');
  if (startsAt && endsAt && endsAt <= startsAt) throw new Error('End date must be after the start date');

  const image = body.image?.url
    ? { url: clip(body.image.url, 1000), publicId: clip(body.image.publicId, 300) }
    : undefined;

  return {
    title,
    slug: await uniqueSlug(title, excludeId),
    description: clip(body.description, 5000),
    tshirt: tshirt._id,
    trouser: trouser._id,
    options,
    image,
    status: body.status === 'draft' ? 'draft' : 'active',
    featured: !!body.featured,
    startsAt,
    endsAt,
  };
}
