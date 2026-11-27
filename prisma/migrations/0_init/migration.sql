-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "dream" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "intensidad" INTEGER NOT NULL DEFAULT 1,
    "fecha" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "interpretacion" TEXT,
    "interpretadoEn" TIMESTAMP(3),

    CONSTRAINT "dream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreamconnection" (
    "id" SERIAL NOT NULL,
    "dreamIdA" INTEGER NOT NULL,
    "dreamIdB" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dreamconnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreamemotion" (
    "dreamId" INTEGER NOT NULL,
    "emotionId" INTEGER NOT NULL,
    "intensidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "dreamemotion_pkey" PRIMARY KEY ("dreamId","emotionId")
);

-- CreateTable
CREATE TABLE "dreamsymbol" (
    "dreamId" INTEGER NOT NULL,
    "symbolId" INTEGER NOT NULL,

    CONSTRAINT "dreamsymbol_pkey" PRIMARY KEY ("dreamId","symbolId")
);

-- CreateTable
CREATE TABLE "dreamtag" (
    "dreamId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "dreamtag_pkey" PRIMARY KEY ("dreamId","tagId")
);

-- CreateTable
CREATE TABLE "emotion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,

    CONSTRAINT "emotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symbol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "frecuencia" INTEGER NOT NULL DEFAULT 1,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "symbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "tokenVerificacion" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dream_userId_fecha_idx" ON "dream"("userId", "fecha");

-- CreateIndex
CREATE INDEX "DreamConnection_dreamIdA_idx" ON "dreamconnection"("dreamIdA");

-- CreateIndex
CREATE INDEX "DreamConnection_dreamIdB_idx" ON "dreamconnection"("dreamIdB");

-- CreateIndex
CREATE UNIQUE INDEX "DreamConnection_dreamIdA_dreamIdB_key" ON "dreamconnection"("dreamIdA", "dreamIdB");

-- CreateIndex
CREATE INDEX "DreamEmotion_emotionId_idx" ON "dreamemotion"("emotionId");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_nombre_key" ON "emotion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_nombre_userId_key" ON "symbol"("nombre", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_nombre_userId_key" ON "tag"("nombre", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_tokenVerificacion_key" ON "user"("tokenVerificacion");

-- AddForeignKey
ALTER TABLE "dream" ADD CONSTRAINT "Dream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamconnection" ADD CONSTRAINT "DreamConnection_dreamIdA_fkey" FOREIGN KEY ("dreamIdA") REFERENCES "dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamconnection" ADD CONSTRAINT "DreamConnection_dreamIdB_fkey" FOREIGN KEY ("dreamIdB") REFERENCES "dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamemotion" ADD CONSTRAINT "DreamEmotion_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamemotion" ADD CONSTRAINT "DreamEmotion_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "emotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamsymbol" ADD CONSTRAINT "DreamSymbol_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamsymbol" ADD CONSTRAINT "DreamSymbol_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamtag" ADD CONSTRAINT "DreamTag_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamtag" ADD CONSTRAINT "DreamTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symbol" ADD CONSTRAINT "Symbol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
