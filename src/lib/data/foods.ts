/**
 * Starter food list with compound content.
 * Level: 3 = high, 2 = medium, 1 = low. Absent = none or trivial.
 *
 * PROTOTYPE DATA: levels are approximate and must be reviewed.
 */

export type Level = 1 | 2 | 3;

export type FoodGroup =
  | "Meat & fish"
  | "Eggs & dairy"
  | "Grains & bread"
  | "Legumes"
  | "Vegetables"
  | "Fruit"
  | "Nuts & seeds"
  | "Drinks"
  | "Other";

export interface Food {
  id: string;
  name: string;
  group: FoodGroup;
  compounds: Record<string, Level>;
  custom?: boolean;
}

export const LEVEL_LABELS: Record<Level, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

const f = (
  id: string,
  name: string,
  group: FoodGroup,
  compounds: Record<string, Level> = {},
): Food => ({ id, name, group, compounds });

export const FOODS: Food[] = [
  // Meat & fish
  f("beef-fresh", "Beef (fresh)", "Meat & fish"),
  f("ground-beef", "Ground beef", "Meat & fish"),
  f("lamb", "Lamb", "Meat & fish"),
  f("pork", "Pork (fresh)", "Meat & fish"),
  f("chicken", "Chicken", "Meat & fish"),
  f("bacon", "Bacon", "Meat & fish", { histamine: 2, tyramine: 2 }),
  f("salami", "Salami / cured sausage", "Meat & fish", { histamine: 3, tyramine: 3, sulfites: 1 }),
  f("ham", "Ham (cured)", "Meat & fish", { histamine: 2, tyramine: 2 }),
  f("dry-aged-beef", "Dry-aged beef", "Meat & fish", { histamine: 2, tyramine: 2 }),
  f("leftover-meat", "Leftover meat (2+ days old)", "Meat & fish", { histamine: 2 }),
  f("liver", "Liver", "Meat & fish"),
  f("salmon", "Salmon (fresh)", "Meat & fish", { histamine: 1 }),
  f("tuna-canned", "Tuna (canned)", "Meat & fish", { histamine: 3 }),
  f("sardines-canned", "Sardines / mackerel (canned)", "Meat & fish", { histamine: 3 }),
  f("shrimp", "Shrimp", "Meat & fish", { histamine: 1, sulfites: 1 }),
  f("bone-broth", "Bone broth (long simmer)", "Meat & fish", { histamine: 2 }),

  // Eggs & dairy
  f("eggs", "Eggs", "Eggs & dairy"),
  f("butter", "Butter", "Eggs & dairy", { casein: 1 }),
  f("ghee", "Ghee", "Eggs & dairy"),
  f("milk", "Milk", "Eggs & dairy", { lactose: 3, casein: 3, fodmaps: 3 }),
  f("cream", "Heavy cream", "Eggs & dairy", { lactose: 1, casein: 1 }),
  f("yogurt", "Yogurt", "Eggs & dairy", { lactose: 2, casein: 3, fodmaps: 2, histamine: 1 }),
  f("soft-cheese", "Soft cheese (ricotta, cottage)", "Eggs & dairy", { lactose: 2, casein: 3, fodmaps: 2 }),
  f("aged-cheese", "Aged cheese (cheddar, parmesan)", "Eggs & dairy", { casein: 3, histamine: 3, tyramine: 3 }),
  f("ice-cream", "Ice cream", "Eggs & dairy", { lactose: 3, casein: 3, fodmaps: 3 }),

  // Grains & bread
  f("wheat-bread", "Wheat bread", "Grains & bread", { gluten: 3, fodmaps: 2, phytates: 2 }),
  f("sourdough", "Sourdough bread (wheat)", "Grains & bread", { gluten: 3, fodmaps: 1, phytates: 1 }),
  f("pasta", "Pasta (wheat)", "Grains & bread", { gluten: 3, fodmaps: 2, phytates: 1 }),
  f("pizza", "Pizza", "Grains & bread", { gluten: 3, fodmaps: 2, casein: 3, histamine: 2, tyramine: 2 }),
  f("barley", "Barley", "Grains & bread", { gluten: 3, fodmaps: 2, phytates: 2 }),
  f("rye", "Rye bread", "Grains & bread", { gluten: 3, fodmaps: 3, phytates: 2 }),
  f("oats", "Oats", "Grains & bread", { gluten: 1, phytates: 3, nickel: 3 }),
  f("rice-white", "White rice", "Grains & bread"),
  f("rice-brown", "Brown rice", "Grains & bread", { phytates: 2 }),
  f("corn", "Corn / tortillas", "Grains & bread", { phytates: 2 }),
  f("breakfast-cereal", "Breakfast cereal (wheat)", "Grains & bread", { gluten: 3, fodmaps: 2, phytates: 2 }),

  // Legumes
  f("kidney-beans", "Kidney beans (cooked)", "Legumes", { lectins: 1, fodmaps: 3, phytates: 3, nickel: 2 }),
  f("kidney-beans-under", "Kidney beans (slow cooker / undercooked)", "Legumes", { lectins: 3, fodmaps: 3, phytates: 3 }),
  f("lentils", "Lentils", "Legumes", { lectins: 1, fodmaps: 2, phytates: 3, nickel: 3 }),
  f("chickpeas", "Chickpeas / hummus", "Legumes", { lectins: 1, fodmaps: 3, phytates: 3, nickel: 2 }),
  f("soy", "Soy / tofu / soy milk", "Legumes", { lectins: 1, fodmaps: 2, phytates: 3, goitrogens: 2, nickel: 3 }),
  f("peanuts", "Peanuts / peanut butter", "Legumes", { lectins: 1, phytates: 2, nickel: 2, oxalates: 2 }),

  // Vegetables
  f("spinach", "Spinach", "Vegetables", { oxalates: 3, histamine: 2, nickel: 1 }),
  f("kale", "Kale (raw)", "Vegetables", { goitrogens: 3, oxalates: 1 }),
  f("broccoli", "Broccoli", "Vegetables", { goitrogens: 2, fodmaps: 1 }),
  f("cauliflower", "Cauliflower", "Vegetables", { goitrogens: 2, fodmaps: 3 }),
  f("cabbage", "Cabbage (raw)", "Vegetables", { goitrogens: 3, fodmaps: 1 }),
  f("sauerkraut", "Sauerkraut / kimchi", "Vegetables", { histamine: 3, tyramine: 2, goitrogens: 1 }),
  f("onion", "Onion", "Vegetables", { fodmaps: 3 }),
  f("garlic", "Garlic", "Vegetables", { fodmaps: 3 }),
  f("tomato", "Tomato", "Vegetables", { glycoalkaloids: 1, histamine: 2, salicylates: 2 }),
  f("tomato-sauce", "Tomato sauce / ketchup", "Vegetables", { glycoalkaloids: 1, histamine: 2, salicylates: 3 }),
  f("potato", "Potato (peeled)", "Vegetables", { glycoalkaloids: 1 }),
  f("potato-skin", "Potato with skin / fries", "Vegetables", { glycoalkaloids: 2 }),
  f("potato-green", "Green or sprouted potato", "Vegetables", { glycoalkaloids: 3 }),
  f("sweet-potato", "Sweet potato", "Vegetables", { oxalates: 2, fodmaps: 1 }),
  f("bell-pepper", "Bell pepper", "Vegetables", { glycoalkaloids: 1, salicylates: 2 }),
  f("chili", "Chili pepper / hot sauce", "Vegetables", { capsaicin: 3, salicylates: 3, glycoalkaloids: 1 }),
  f("eggplant", "Eggplant", "Vegetables", { glycoalkaloids: 1, histamine: 2 }),
  f("beets", "Beets", "Vegetables", { oxalates: 3, fodmaps: 2 }),
  f("mushrooms", "Mushrooms", "Vegetables", { fodmaps: 3 }),
  f("avocado", "Avocado", "Vegetables", { histamine: 2, fodmaps: 2, salicylates: 2 }),
  f("cucumber", "Cucumber", "Vegetables", { salicylates: 2 }),
  f("lettuce", "Lettuce", "Vegetables"),
  f("carrot", "Carrot", "Vegetables", { salicylates: 1 }),
  f("pickles", "Pickles", "Vegetables", { histamine: 2, salicylates: 2, sulfites: 1 }),

  // Fruit
  f("apple", "Apple", "Fruit", { fodmaps: 3, salicylates: 2 }),
  f("pear", "Pear", "Fruit", { fodmaps: 3, salicylates: 1 }),
  f("banana", "Banana (ripe)", "Fruit", { fodmaps: 2, histamine: 1, tyramine: 1 }),
  f("berries", "Strawberries / raspberries", "Fruit", { salicylates: 3, histamine: 2 }),
  f("blueberries", "Blueberries", "Fruit", { salicylates: 3 }),
  f("citrus", "Orange / citrus", "Fruit", { salicylates: 2, histamine: 1 }),
  f("grapes", "Grapes", "Fruit", { salicylates: 3 }),
  f("dried-fruit", "Dried fruit (raisins, apricots)", "Fruit", { fodmaps: 3, salicylates: 3, sulfites: 3, oxalates: 1 }),
  f("mango", "Mango", "Fruit", { fodmaps: 3, salicylates: 2 }),
  f("rhubarb", "Rhubarb", "Fruit", { oxalates: 3 }),
  f("pineapple", "Pineapple", "Fruit", { salicylates: 3 }),

  // Nuts & seeds
  f("almonds", "Almonds / almond flour", "Nuts & seeds", { oxalates: 3, phytates: 3, salicylates: 3, nickel: 2 }),
  f("cashews", "Cashews", "Nuts & seeds", { fodmaps: 3, oxalates: 2, phytates: 2, nickel: 3 }),
  f("walnuts", "Walnuts", "Nuts & seeds", { phytates: 2, histamine: 1, nickel: 2 }),
  f("seeds", "Chia / flax / sunflower seeds", "Nuts & seeds", { phytates: 3, nickel: 2 }),

  // Drinks
  f("coffee", "Coffee", "Drinks", { caffeine: 3, salicylates: 1 }),
  f("decaf", "Decaf coffee", "Drinks", { caffeine: 1 }),
  f("black-tea", "Black tea", "Drinks", { caffeine: 2, salicylates: 3, oxalates: 2 }),
  f("green-tea", "Green tea", "Drinks", { caffeine: 2, salicylates: 2 }),
  f("energy-drink", "Energy drink", "Drinks", { caffeine: 3 }),
  f("red-wine", "Red wine", "Drinks", { alcohol: 3, histamine: 3, tyramine: 2, sulfites: 2, salicylates: 3 }),
  f("white-wine", "White wine", "Drinks", { alcohol: 3, histamine: 1, sulfites: 3 }),
  f("beer", "Beer", "Drinks", { alcohol: 2, gluten: 2, histamine: 2, tyramine: 1 }),
  f("spirits", "Spirits (vodka, whisky)", "Drinks", { alcohol: 3 }),
  f("kombucha", "Kombucha", "Drinks", { histamine: 2, caffeine: 1 }),
  f("juice", "Fruit juice (apple)", "Drinks", { fodmaps: 3, salicylates: 2 }),

  // Other
  f("dark-chocolate", "Dark chocolate / cocoa", "Other", { caffeine: 1, oxalates: 3, nickel: 3, histamine: 1, tyramine: 1 }),
  f("honey", "Honey", "Other", { fodmaps: 3, salicylates: 2 }),
  f("soy-sauce", "Soy sauce", "Other", { gluten: 2, histamine: 3, tyramine: 3 }),
  f("vinegar", "Vinegar", "Other", { histamine: 2, sulfites: 1 }),
  f("spices", "Spice mix (curry, paprika, cumin)", "Other", { salicylates: 3, glycoalkaloids: 1 }),
  f("mint", "Mint / peppermint", "Other", { salicylates: 3 }),
  f("sugar-free", "Sugar-free sweets (sorbitol, xylitol)", "Other", { fodmaps: 3 }),
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(
  FOODS.map((food) => [food.id, food]),
);
