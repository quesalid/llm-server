const config = {
  testEnvironment: "node",
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        pageTitle: "LOM API TEST",
        logoImgPath: "test/TestIcon.png",
        inlineSource: true,
        customInfos: [
          { title: "Customer", value: "Liv.In.G." },
          { title: "Device", value: "127.0.0.1" },
          { title: "Tested by", value: "P. Pulicani" },
        ],
        darkTheme: true,
      },
    ],
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
};

export default config;
