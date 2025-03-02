/*
  Warnings:

  - You are about to drop the column `cookingMethod` on the `RecipeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `cuisineType` on the `RecipeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `RecipeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `mealType` on the `RecipeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `recipeIngredients` on the `RecipeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `recipeInstructions` on the `RecipeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `recipeName` on the `RecipeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `usedIngredients` on the `RecipeHistory` table. All the data in the column will be lost.
  - Added the required column `cookTime` to the `RecipeHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servings` to the `RecipeHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `RecipeHistory` table without a default value. This is not possible if the table is not empty.
  - Made the column `prepTime` on table `RecipeHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "RecipeHistory" DROP COLUMN "cookingMethod",
DROP COLUMN "cuisineType",
DROP COLUMN "imageUrl",
DROP COLUMN "mealType",
DROP COLUMN "recipeIngredients",
DROP COLUMN "recipeInstructions",
DROP COLUMN "recipeName",
DROP COLUMN "usedIngredients",
ADD COLUMN     "cookTime" TEXT NOT NULL,
ADD COLUMN     "detectedIngredients" TEXT[],
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "instructions" TEXT[],
ADD COLUMN     "servings" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "prepTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "RecipeHistory_userId_idx" ON "RecipeHistory"("userId");
