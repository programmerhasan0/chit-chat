export default () => ({
    port: process.env.PORT || 3000,
    jwt_secret: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
});
