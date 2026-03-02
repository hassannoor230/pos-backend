app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartPOS Pro API Running 🚀'
  });
});