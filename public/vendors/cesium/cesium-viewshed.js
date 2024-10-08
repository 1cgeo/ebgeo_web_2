const ViewShead3D_FS =
  "\x0auniform\x20float\x20czzj;\x0auniform\x20float\x20dis;\x0auniform\x20float\x20spzj;\x0auniform\x20vec3\x20visibleColor;\x0auniform\x20vec3\x20disVisibleColor;\x0auniform\x20float\x20mixNum;\x0auniform\x20sampler2D\x20colorTexture;\x0auniform\x20sampler2D\x20stcshadow;\x20\x0auniform\x20sampler2D\x20depthTexture;\x0auniform\x20mat4\x20_shadowMap_matrix;\x20\x0auniform\x20vec4\x20shadowMap_lightPositionEC;\x20\x0auniform\x20vec4\x20shadowMap_lightDirectionEC;\x0auniform\x20vec3\x20shadowMap_lightUp;\x0auniform\x20vec3\x20shadowMap_lightDir;\x0auniform\x20vec3\x20shadowMap_lightRight;\x0auniform\x20vec4\x20shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;\x20\x0auniform\x20vec4\x20shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;\x20\x0avarying\x20vec2\x20v_textureCoordinates;\x0avec4\x20toEye(in\x20vec2\x20uv,\x20in\x20float\x20depth){\x0a\x20\x20\x20\x20vec2\x20xy\x20=\x20vec2((uv.x\x20*\x202.0\x20-\x201.0),(uv.y\x20*\x202.0\x20-\x201.0));\x0a\x20\x20\x20\x20vec4\x20posInCamera\x20=czm_inverseProjection\x20*\x20vec4(xy,\x20depth,\x201.0);\x0a\x20\x20\x20\x20posInCamera\x20=posInCamera\x20/\x20posInCamera.w;\x0a\x20\x20\x20\x20return\x20posInCamera;\x0a}\x0afloat\x20getDepth(in\x20vec4\x20depth){\x0a\x20\x20\x20\x20float\x20z_window\x20=\x20czm_unpackDepth(depth);\x0a\x20\x20\x20\x20z_window\x20=\x20czm_reverseLogDepth(z_window);\x0a\x20\x20\x20\x20float\x20n_range\x20=\x20czm_depthRange.near;\x0a\x20\x20\x20\x20float\x20f_range\x20=\x20czm_depthRange.far;\x0a\x20\x20\x20\x20return\x20(2.0\x20*\x20z_window\x20-\x20n_range\x20-\x20f_range)\x20/\x20(f_range\x20-\x20n_range);\x0a}\x0afloat\x20_czm_sampleShadowMap(sampler2D\x20shadowMap,\x20vec2\x20uv){\x0a\x20\x20\x20\x20return\x20texture2D(shadowMap,\x20uv).r;\x0a}\x0afloat\x20_czm_shadowDepthCompare(sampler2D\x20shadowMap,\x20vec2\x20uv,\x20float\x20depth){\x0a\x20\x20\x20\x20return\x20step(depth,\x20_czm_sampleShadowMap(shadowMap,\x20uv));\x0a}\x0afloat\x20_czm_shadowVisibility(sampler2D\x20shadowMap,\x20czm_shadowParameters\x20shadowParameters){\x0a\x20\x20\x20\x20float\x20depthBias\x20=\x20shadowParameters.depthBias;\x0a\x20\x20\x20\x20float\x20depth\x20=\x20shadowParameters.depth;\x0a\x20\x20\x20\x20float\x20nDotL\x20=\x20shadowParameters.nDotL;\x0a\x20\x20\x20\x20float\x20normalShadingSmooth\x20=\x20shadowParameters.normalShadingSmooth;\x0a\x20\x20\x20\x20float\x20darkness\x20=\x20shadowParameters.darkness;\x0a\x20\x20\x20\x20vec2\x20uv\x20=\x20shadowParameters.texCoords;\x0a\x20\x20\x20\x20depth\x20-=\x20depthBias;\x0a\x20\x20\x20\x20vec2\x20texelStepSize\x20=\x20shadowParameters.texelStepSize;\x0a\x20\x20\x20\x20float\x20radius\x20=\x201.0;\x0a\x20\x20\x20\x20float\x20dx0\x20=\x20-texelStepSize.x\x20*\x20radius;\x0a\x20\x20\x20\x20float\x20dy0\x20=\x20-texelStepSize.y\x20*\x20radius;\x0a\x20\x20\x20\x20float\x20dx1\x20=\x20texelStepSize.x\x20*\x20radius;\x0a\x20\x20\x20\x20float\x20dy1\x20=\x20texelStepSize.y\x20*\x20radius;\x0a\x20\x20\x20\x20float\x20visibility\x20=\x20\x0a\x20\x20\x20\x20(\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv,\x20depth)\x0a\x20\x20\x20\x20+_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(dx0,\x20dy0),\x20depth)\x20+\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(0.0,\x20dy0),\x20depth)\x20+\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(dx1,\x20dy0),\x20depth)\x20+\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(dx0,\x200.0),\x20depth)\x20+\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(dx1,\x200.0),\x20depth)\x20+\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(dx0,\x20dy1),\x20depth)\x20+\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(0.0,\x20dy1),\x20depth)\x20+\x0a\x20\x20\x20\x20_czm_shadowDepthCompare(shadowMap,\x20uv\x20+\x20vec2(dx1,\x20dy1),\x20depth)\x0a\x20\x20\x20\x20)\x20*\x20(1.0\x20/\x209.0)\x0a\x20\x20\x20\x20;\x0a\x20\x20\x20\x20return\x20visibility;\x0a}\x0avec3\x20pointProjectOnPlane(in\x20vec3\x20planeNormal,\x20in\x20vec3\x20planeOrigin,\x20in\x20vec3\x20point){\x0a\x20\x20\x20\x20vec3\x20v01\x20=\x20point\x20-planeOrigin;\x0a\x20\x20\x20\x20float\x20d\x20=\x20dot(planeNormal,\x20v01)\x20;\x0a\x20\x20\x20\x20return\x20(point\x20-\x20planeNormal\x20*\x20d);\x0a}\x0afloat\x20ptm(vec3\x20pt){\x0a\x20\x20\x20\x20return\x20sqrt(pt.x*pt.x\x20+\x20pt.y*pt.y\x20+\x20pt.z*pt.z);\x0a}\x0avoid\x20main()\x20\x0a{\x20\x0a\x20\x20\x20\x20const\x20float\x20PI\x20=\x203.141592653589793;\x0a\x20\x20\x20\x20vec4\x20color\x20=\x20texture2D(colorTexture,\x20v_textureCoordinates);\x0a\x20\x20\x20\x20vec4\x20currD\x20=\x20texture2D(depthTexture,\x20v_textureCoordinates);\x0a\x20\x20\x20\x20if(currD.r>=1.0){\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20color;\x0a\x20\x20\x20\x20\x20\x20\x20\x20return;\x0a\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20float\x20depth\x20=\x20getDepth(currD);\x0a\x20\x20\x20\x20vec4\x20positionEC\x20=\x20toEye(v_textureCoordinates,\x20depth);\x0a\x20\x20\x20\x20vec3\x20normalEC\x20=\x20vec3(1.0);\x0a\x20\x20\x20\x20czm_shadowParameters\x20shadowParameters;\x20\x0a\x20\x20\x20\x20shadowParameters.texelStepSize\x20=\x20shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;\x20\x0a\x20\x20\x20\x20shadowParameters.depthBias\x20=\x20shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;\x20\x0a\x20\x20\x20\x20shadowParameters.normalShadingSmooth\x20=\x20shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;\x20\x0a\x20\x20\x20\x20shadowParameters.darkness\x20=\x20shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;\x20\x0a\x20\x20\x20\x20shadowParameters.depthBias\x20*=\x20max(depth\x20*\x200.01,\x201.0);\x20\x0a\x20\x20\x20\x20vec3\x20directionEC\x20=\x20normalize(positionEC.xyz\x20-\x20shadowMap_lightPositionEC.xyz);\x20\x0a\x20\x20\x20\x20float\x20nDotL\x20=\x20clamp(dot(normalEC,\x20-directionEC),\x200.0,\x201.0);\x20\x0a\x20\x20\x20\x20vec4\x20shadowPosition\x20=\x20_shadowMap_matrix\x20*\x20positionEC;\x20\x0a\x20\x20\x20\x20shadowPosition\x20/=\x20shadowPosition.w;\x20\x0a\x20\x20\x20\x20if\x20(any(lessThan(shadowPosition.xyz,\x20vec3(0.0)))\x20||\x20any(greaterThan(shadowPosition.xyz,\x20vec3(1.0))))\x20\x0a\x20\x20\x20\x20{\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20color;\x0a\x20\x20\x20\x20\x20\x20\x20\x20return;\x0a\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20//åæ ‡ä¸Žè§†ç‚¹ä½ç½®è·ç¦»ï¼Œå¤§äºŽæœ€å¤§è·ç¦»åˆ™èˆå¼ƒé˜´å½±æ•ˆæžœ\x0a\x20\x20\x20\x20vec4\x20lw\x20=\x20czm_inverseView*\x20\x20vec4(shadowMap_lightPositionEC.xyz,\x201.0);\x0a\x20\x20\x20\x20vec4\x20vw\x20=\x20czm_inverseView*\x20vec4(positionEC.xyz,\x201.0);\x0a\x20\x20\x20\x20if(distance(lw.xyz,vw.xyz)>dis){\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20color;\x0a\x20\x20\x20\x20\x20\x20\x20\x20return;\x0a\x20\x20\x20\x20}\x0a\x0a\x0a\x20\x20\x20\x20//æ°´å¹³å¤¹è§’é™åˆ¶\x0a\x20\x20\x20\x20vec3\x20ptOnSP\x20=\x20pointProjectOnPlane(shadowMap_lightUp,lw.xyz,vw.xyz);\x0a\x20\x20\x20\x20directionEC\x20=\x20ptOnSP\x20-\x20lw.xyz;\x0a\x20\x20\x20\x20float\x20directionECMO\x20=\x20ptm(directionEC.xyz);\x0a\x20\x20\x20\x20float\x20shadowMap_lightDirMO\x20=\x20ptm(shadowMap_lightDir.xyz);\x0a\x20\x20\x20\x20float\x20cosJJ\x20=\x20dot(directionEC,shadowMap_lightDir)/(directionECMO*shadowMap_lightDirMO);\x0a\x20\x20\x20\x20float\x20degJJ\x20=\x20acos(cosJJ)*(180.0\x20/\x20PI);\x0a\x20\x20\x20\x20degJJ\x20=\x20abs(degJJ);\x0a\x20\x20\x20\x20if(degJJ>spzj/2.0){\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20color;\x0a\x20\x20\x20\x20\x20\x20\x20\x20return;\x0a\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20//åž‚ç›´å¤¹è§’é™åˆ¶\x0a\x20\x20\x20\x20vec3\x20ptOnCZ\x20=\x20pointProjectOnPlane(shadowMap_lightRight,lw.xyz,vw.xyz);\x0a\x20\x20\x20\x20vec3\x20dirOnCZ\x20=\x20ptOnCZ\x20-\x20lw.xyz;\x0a\x20\x20\x20\x20float\x20dirOnCZMO\x20=\x20ptm(dirOnCZ);\x0a\x20\x20\x20\x20float\x20cosJJCZ\x20=\x20dot(dirOnCZ,shadowMap_lightDir)/(dirOnCZMO*shadowMap_lightDirMO);\x0a\x20\x20\x20\x20float\x20degJJCZ\x20=\x20acos(cosJJCZ)*(180.0\x20/\x20PI);\x0a\x20\x20\x20\x20degJJCZ\x20=\x20abs(degJJCZ);\x0a\x20\x20\x20\x20if(degJJCZ>czzj/2.0){\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20color;\x0a\x20\x20\x20\x20\x20\x20\x20\x20return;\x0a\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20shadowParameters.texCoords\x20=\x20shadowPosition.xy;\x20\x0a\x20\x20\x20\x20shadowParameters.depth\x20=\x20shadowPosition.z;\x20\x0a\x20\x20\x20\x20shadowParameters.nDotL\x20=\x20nDotL;\x20\x0a\x20\x20\x20\x20float\x20visibility\x20=\x20_czm_shadowVisibility(stcshadow,\x20shadowParameters);\x20\x0a\x20\x20\x20\x20if(visibility==1.0){\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20mix(color,vec4(visibleColor,1.0),mixNum);\x0a\x20\x20\x20\x20}else{\x0a\x20\x20\x20\x20\x20\x20\x20\x20if(abs(shadowPosition.z-0.0)<0.01){\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20return;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20mix(color,vec4(disVisibleColor,1.0),mixNum);\x0a\x20\x20\x20\x20}\x0a}\x0a";
!(function (_0x4d65fa, _0x17018a) {
  var _0x210d09 = {
    ViGJZ: function (_0x468194, _0x1726d9) {
      return _0x468194 == _0x1726d9;
    },
    eJGiW: "object",
    JOuXj: function (_0x290e0d, _0x27e453) {
      return _0x290e0d(_0x27e453);
    },
    rfkXD: function (_0xc4ee5c, _0x4a0868) {
      return _0xc4ee5c(_0x4a0868);
    },
    JOQHD: "Cesium",
    sVMtp: "function",
    Ounbr: function (_0x55aa7c, _0x2b1877, _0x4ace29) {
      return _0x55aa7c(_0x2b1877, _0x4ace29);
    },
    XoUNH: function (_0x574eb0, _0x373b90) {
      return _0x574eb0(_0x373b90);
    },
  };
  _0x210d09["ViGJZ"](_0x210d09["eJGiW"], typeof exports) &&
  _0x210d09["ViGJZ"](_0x210d09["eJGiW"], typeof module)
    ? (module["exports"] = _0x210d09["JOuXj"](
        _0x17018a,
        _0x210d09["rfkXD"](require, _0x210d09["JOQHD"])
      ))
    : _0x210d09["ViGJZ"](_0x210d09["sVMtp"], typeof define) && define["amd"]
      ? _0x210d09["Ounbr"](define, [_0x210d09["JOQHD"]], _0x17018a)
      : _0x210d09["ViGJZ"](_0x210d09["eJGiW"], typeof exports)
        ? (exports["space"] = _0x210d09["rfkXD"](
            _0x17018a,
            _0x210d09["XoUNH"](require, _0x210d09["JOQHD"])
          ))
        : (_0x4d65fa["space"] = _0x210d09["XoUNH"](
            _0x17018a,
            _0x4d65fa["Cesium"]
          ));
})("undefined" != typeof self ? self : this, function (_0x3f3dfd) {
  var _0xea530e = {
    czpQM: function (_0xf33c49, _0x3a3ce7) {
      return _0xf33c49(_0x3a3ce7);
    },
    uBssY: function (_0x213198, _0x1624c6, _0x2d33db) {
      return _0x213198(_0x1624c6, _0x2d33db);
    },
    xjDCe: function (_0x1de3e8, _0x56280f, _0x1d63c7) {
      return _0x1de3e8(_0x56280f, _0x1d63c7);
    },
    tVktx: function (_0x4aab98, _0x977c23, _0x35592e) {
      return _0x4aab98(_0x977c23, _0x35592e);
    },
    scWtJ: function (_0x181053, _0x1077c8, _0x4dc010) {
      return _0x181053(_0x1077c8, _0x4dc010);
    },
    gUJuw: function (_0x414f3d, _0x5f9734, _0xa29c8e) {
      return _0x414f3d(_0x5f9734, _0xa29c8e);
    },
    nDahB: function (_0x310f78, _0x3589ee, _0x3ec205) {
      return _0x310f78(_0x3589ee, _0x3ec205);
    },
    LCjaL: function (_0x4c1970, _0xbaaa29, _0x20670e) {
      return _0x4c1970(_0xbaaa29, _0x20670e);
    },
    YpRpU: function (_0x323ae1, _0x4df88b, _0x3fdf39) {
      return _0x323ae1(_0x4df88b, _0x3fdf39);
    },
    CtQAZ: function (_0x509c4e, _0x332234) {
      return _0x509c4e(_0x332234);
    },
    lOyiS: function (_0x217528, _0x4ce440) {
      return _0x217528(_0x4ce440);
    },
    TWgRf: function (_0x5753a0, _0x1af2f6, _0x93b7de) {
      return _0x5753a0(_0x1af2f6, _0x93b7de);
    },
    IhvSk: function (_0x4f92f2, _0x1bd51c, _0x39b723) {
      return _0x4f92f2(_0x1bd51c, _0x39b723);
    },
    hvNmI: function (_0x1e4e04, _0x163482, _0xdac2c) {
      return _0x1e4e04(_0x163482, _0xdac2c);
    },
    BYosh: function (_0x474c66, _0x485108, _0x5def7d) {
      return _0x474c66(_0x485108, _0x5def7d);
    },
    qxOGH: function (_0x1ee72c, _0x48a3e2, _0x5e82a2) {
      return _0x1ee72c(_0x48a3e2, _0x5e82a2);
    },
    VygMe: "horizontal",
    uwCLU: function (_0x54e53b, _0x5df6cf) {
      return _0x54e53b - _0x5df6cf;
    },
    Crtrc: function (_0x3463bb, _0x4ca9e8) {
      return _0x3463bb * _0x4ca9e8;
    },
    tEfaK: function (_0x4e73bd, _0x4592e6) {
      return _0x4e73bd < _0x4592e6;
    },
    QiiKl: function (_0x149427, _0x1fa216) {
      return _0x149427 + _0x1fa216;
    },
    UWvbN: function (_0x17acf1, _0x39648c) {
      return _0x17acf1 + _0x39648c;
    },
    yJZFf: function (_0x6759db, _0x16b38e) {
      return _0x6759db && _0x16b38e;
    },
    MnEec: "3|5|1|6|0|4|2|7",
    QffpP: function (_0x1671bc, _0x12901d) {
      return _0x1671bc * _0x12901d;
    },
    mFFtQ: function (_0x335f22, _0xbac2d6) {
      return _0x335f22 < _0xbac2d6;
    },
    AwaPT: function (_0x6e8d44, _0x52ec4d) {
      return _0x6e8d44 < _0x52ec4d;
    },
    NsfsI: function (_0x4cae2f, _0x2fb269, _0x290fdb, _0x3758c1) {
      return _0x4cae2f(_0x2fb269, _0x290fdb, _0x3758c1);
    },
    jYcTo: function (_0x5c320d, _0xcf8417) {
      return _0x5c320d == _0xcf8417;
    },
    WEGpU: function (_0x366a37, _0x15f068, _0x3eca08, _0x4f9916) {
      return _0x366a37(_0x15f068, _0x3eca08, _0x4f9916);
    },
    SLFSM: function (_0x32248e, _0x3a29dd, _0x287863, _0x323042) {
      return _0x32248e(_0x3a29dd, _0x287863, _0x323042);
    },
    fNksV: function (_0x35fe08, _0x77d191, _0x7d8f23) {
      return _0x35fe08(_0x77d191, _0x7d8f23);
    },
    IYXVA: "3|7|6|1|4|0|5|2",
    lOKbc: function (
      _0x2b3abb,
      _0x1b9465,
      _0x57608e,
      _0x11832c,
      _0xbf975e,
      _0x52fb35,
      _0x128dbf,
      _0x331670,
      _0x4481f8,
      _0x4c1e33,
      _0x49ef65,
      _0x3ef48e
    ) {
      return _0x2b3abb(
        _0x1b9465,
        _0x57608e,
        _0x11832c,
        _0xbf975e,
        _0x52fb35,
        _0x128dbf,
        _0x331670,
        _0x4481f8,
        _0x4c1e33,
        _0x49ef65,
        _0x3ef48e
      );
    },
    VsmEJ: function (
      _0x19062c,
      _0x368a01,
      _0x51062f,
      _0x1780b0,
      _0x26852e,
      _0x240d46,
      _0x37634f,
      _0x2b7503,
      _0x560129,
      _0x5c95b2,
      _0x471520,
      _0x31e6e9,
      _0x3c16c6
    ) {
      return _0x19062c(
        _0x368a01,
        _0x51062f,
        _0x1780b0,
        _0x26852e,
        _0x240d46,
        _0x37634f,
        _0x2b7503,
        _0x560129,
        _0x5c95b2,
        _0x471520,
        _0x31e6e9,
        _0x3c16c6
      );
    },
    OBCdm: "5|6|7|0|3|4|1|2",
    lVppA: function (_0x2cc554, _0x2c7437) {
      return _0x2cc554 < _0x2c7437;
    },
    RyEfa: function (_0x5e0fcb, _0x9f6bc5) {
      return _0x5e0fcb + _0x9f6bc5;
    },
    DOUQa: function (_0x90d276, _0x3a766d) {
      return _0x90d276 * _0x3a766d;
    },
    GxPlf: "uniform",
    dnIVN: function (_0xcf962c, _0x4c789a) {
      return _0xcf962c === _0x4c789a;
    },
    AGnYN: function (_0x44f607, _0x37b36a) {
      return _0x44f607 < _0x37b36a;
    },
    wnRok:
      "halfAngle\x20must\x20be\x20greater\x20than\x20or\x20equal\x20to\x20zero.",
    Qxjgf: function (_0x3b484e, _0x2155b7) {
      return _0x3b484e != _0x2155b7;
    },
    mGVKO: function (_0x505788, _0x11c35a) {
      return _0x505788 != _0x11c35a;
    },
    RpyBI: "9|13|11|7|5|12|2|8|0|4|6|10|3|1",
    aSiiy: function (_0xa1fc98, _0x3da325) {
      return _0xa1fc98 !== _0x3da325;
    },
    KcaCE: function (_0x331b5f, _0x3af645) {
      return _0x331b5f !== _0x3af645;
    },
    CcUfv: function (_0x44b843, _0x516026) {
      return _0x44b843 !== _0x516026;
    },
    iYEIL: "2|0|3|1|4",
    FJODi: function (_0x1f0677, _0x27cb43) {
      return _0x1f0677 * _0x27cb43;
    },
    BZzDj: function (_0x2db642, _0x3439b6) {
      return _0x2db642 - _0x3439b6;
    },
    tXoyj: function (_0x10b5f5, _0x3f1c8a) {
      return _0x10b5f5 * _0x3f1c8a;
    },
    XqDfU: function (_0x28b24f, _0x4ea8c0) {
      return _0x28b24f / _0x4ea8c0;
    },
    RenqP: function (_0x569349, _0x48b590) {
      return _0x569349 % _0x48b590;
    },
    XnteI: function (_0x2f86e5, _0x2fdea4) {
      return _0x2f86e5 || _0x2fdea4;
    },
    nQBWt:
      "this.radius\x20must\x20be\x20greater\x20than\x20or\x20equal\x20to\x20zero.",
    HYsPa: function (_0x1f88e3, _0x2bdff6) {
      return _0x1f88e3(_0x2bdff6);
    },
    qIJyS: function (_0x27cdf2, _0x494ba7) {
      return _0x27cdf2(_0x494ba7);
    },
    eShrj: function (_0x51610f, _0x46a1cb) {
      return _0x51610f(_0x46a1cb);
    },
    TGpuW: function (_0x30447d, _0x4c4247) {
      return _0x30447d * _0x4c4247;
    },
    XnWfQ: function (_0x2069d7, _0x10d049) {
      return _0x2069d7 * _0x10d049;
    },
    bwPFA: function (_0x5200e2, _0xc69fe9) {
      return _0x5200e2(_0xc69fe9);
    },
    tFcxJ: function (_0x151dc7, _0x4c41d4) {
      return _0x151dc7 - _0x4c41d4;
    },
    rIhYm: function (_0xd3cfbf, _0x1a5ab7) {
      return _0xd3cfbf * _0x1a5ab7;
    },
    OGOAp: function (_0x3f5d80, _0x487e49) {
      return _0x3f5d80(_0x487e49);
    },
    JNTyN: "__esModule",
    UTqFL: function (_0x5865a9, _0x495b16) {
      return _0x5865a9(_0x495b16);
    },
    FrdhQ: function (_0x36008b, _0x593cbb) {
      return _0x36008b(_0x593cbb);
    },
    kUDkF: function (_0x23f19e, _0x9d5758) {
      return _0x23f19e(_0x9d5758);
    },
    LmKVx: function (_0x2c1e90, _0x59dec2) {
      return _0x2c1e90(_0x59dec2);
    },
    pFTyO: function (_0x52381b, _0x4ce884) {
      return _0x52381b(_0x4ce884);
    },
    yQmmt: function (_0xae5257, _0x169760) {
      return _0xae5257(_0x169760);
    },
    UEjUU: "5|2|3|1|0|4",
    uRvMw: function (_0x34e1d9, _0xd601de) {
      return _0x34e1d9(_0xd601de);
    },
    aKyxr: function (_0x53bb30, _0x258476) {
      return _0x53bb30(_0x258476);
    },
    xUQpS: function (_0x416a3d, _0x53ffad, _0x3da5c3, _0x52beb6) {
      return _0x416a3d(_0x53ffad, _0x3da5c3, _0x52beb6);
    },
    gUHac:
      "attribute\x20vec4\x20position;\x0d\x0aattribute\x20vec3\x20normal;\x0d\x0a\x0d\x0avarying\x20vec3\x20v_position;\x0d\x0avarying\x20vec3\x20v_positionWC;\x0d\x0avarying\x20vec3\x20v_positionEC;\x0d\x0avarying\x20vec3\x20v_normalEC;\x0d\x0a\x0d\x0avoid\x20main()\x0d\x0a{\x0d\x0a\x20\x20\x20\x20gl_Position\x20=\x20czm_modelViewProjection\x20*\x20position;\x0d\x0a\x20\x20\x20\x20v_position\x20=\x20vec3(position);\x0d\x0a\x20\x20\x20\x20v_positionWC\x20=\x20(czm_model\x20*\x20position).xyz;\x0d\x0a\x20\x20\x20\x20v_positionEC\x20=\x20(czm_modelView\x20*\x20position).xyz;\x0d\x0a\x20\x20\x20\x20v_normalEC\x20=\x20czm_normal\x20*\x20normal;\x0d\x0a}",
    WOGIP:
      "#ifdef\x20GL_OES_standard_derivatives\x0d\x0a#extension\x20GL_OES_standard_derivatives\x20:\x20enable\x0d\x0a#endif\x0d\x0a\x0d\x0auniform\x20bool\x20u_showIntersection;\x0d\x0auniform\x20bool\x20u_showThroughEllipsoid;\x0d\x0a\x0d\x0auniform\x20float\x20u_radius;\x0d\x0auniform\x20float\x20u_xHalfAngle;\x0d\x0auniform\x20float\x20u_yHalfAngle;\x0d\x0auniform\x20float\x20u_normalDirection;\x0d\x0auniform\x20float\x20u_type;\x0d\x0a\x0d\x0avarying\x20vec3\x20v_position;\x0d\x0avarying\x20vec3\x20v_positionWC;\x0d\x0avarying\x20vec3\x20v_positionEC;\x0d\x0avarying\x20vec3\x20v_normalEC;\x0d\x0a\x0d\x0avec4\x20getColor(float\x20sensorRadius,\x20vec3\x20pointEC)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20czm_materialInput\x20materialInput;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20pointMC\x20=\x20(czm_inverseModelView\x20*\x20vec4(pointEC,\x201.0)).xyz;\x0d\x0a\x20\x20\x20\x20materialInput.st\x20=\x20sensor2dTextureCoordinates(sensorRadius,\x20pointMC);\x0d\x0a\x20\x20\x20\x20materialInput.str\x20=\x20pointMC\x20/\x20sensorRadius;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20positionToEyeEC\x20=\x20-v_positionEC;\x0d\x0a\x20\x20\x20\x20materialInput.positionToEyeEC\x20=\x20positionToEyeEC;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20normalEC\x20=\x20normalize(v_normalEC);\x0d\x0a\x20\x20\x20\x20materialInput.normalEC\x20=\x20u_normalDirection\x20*\x20normalEC;\x0d\x0a\x0d\x0a\x20\x20\x20\x20czm_material\x20material\x20=\x20czm_getMaterial(materialInput);\x0d\x0a\x0d\x0a\x20\x20\x20\x20return\x20mix(czm_phong(normalize(positionToEyeEC),\x20material,czm_lightDirectionEC),\x20vec4(material.diffuse,\x20material.alpha),\x200.4);\x0d\x0a\x0d\x0a}\x0d\x0a\x0d\x0abool\x20isOnBoundary(float\x20value,\x20float\x20epsilon)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20float\x20width\x20=\x20getIntersectionWidth();\x0d\x0a\x20\x20\x20\x20float\x20tolerance\x20=\x20width\x20*\x20epsilon;\x0d\x0a\x0d\x0a#ifdef\x20GL_OES_standard_derivatives\x0d\x0a\x20\x20\x20\x20float\x20delta\x20=\x20max(abs(dFdx(value)),\x20abs(dFdy(value)));\x0d\x0a\x20\x20\x20\x20float\x20pixels\x20=\x20width\x20*\x20delta;\x0d\x0a\x20\x20\x20\x20float\x20temp\x20=\x20abs(value);\x0d\x0a\x20\x20\x20\x20//\x20There\x20are\x20a\x20couple\x20things\x20going\x20on\x20here.\x0d\x0a\x20\x20\x20\x20//\x20First\x20we\x20test\x20the\x20value\x20at\x20the\x20current\x20fragment\x20to\x20see\x20if\x20it\x20is\x20within\x20the\x20tolerance.\x0d\x0a\x20\x20\x20\x20//\x20We\x20also\x20want\x20to\x20check\x20if\x20the\x20value\x20of\x20an\x20adjacent\x20pixel\x20is\x20within\x20the\x20tolerance,\x0d\x0a\x20\x20\x20\x20//\x20but\x20we\x20don\x27t\x20want\x20to\x20admit\x20points\x20that\x20are\x20obviously\x20not\x20on\x20the\x20surface.\x0d\x0a\x20\x20\x20\x20//\x20For\x20example,\x20if\x20we\x20are\x20looking\x20for\x20\x22value\x22\x20to\x20be\x20close\x20to\x200,\x20but\x20value\x20is\x201\x20and\x20the\x20adjacent\x20value\x20is\x202,\x0d\x0a\x20\x20\x20\x20//\x20then\x20the\x20delta\x20would\x20be\x201\x20and\x20\x22temp\x20-\x20delta\x22\x20would\x20be\x20\x221\x20-\x201\x22\x20which\x20is\x20zero\x20even\x20though\x20neither\x20of\x0d\x0a\x20\x20\x20\x20//\x20the\x20points\x20is\x20close\x20to\x20zero.\x0d\x0a\x20\x20\x20\x20return\x20temp\x20<\x20tolerance\x20&&\x20temp\x20<\x20pixels\x20||\x20(delta\x20<\x2010.0\x20*\x20tolerance\x20&&\x20temp\x20-\x20delta\x20<\x20tolerance\x20&&\x20temp\x20<\x20pixels);\x0d\x0a#else\x0d\x0a\x20\x20\x20\x20return\x20abs(value)\x20<\x20tolerance;\x0d\x0a#endif\x0d\x0a}\x0d\x0a\x0d\x0avec4\x20shade(bool\x20isOnBoundary)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20if\x20(u_showIntersection\x20&&\x20isOnBoundary)\x0d\x0a\x20\x20\x20\x20{\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20return\x20getIntersectionColor();\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x20\x20\x20\x20if(u_type\x20==\x201.0){\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20return\x20getLineColor();\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x20\x20\x20\x20return\x20getColor(u_radius,\x20v_positionEC);\x0d\x0a}\x0d\x0a\x0d\x0afloat\x20ellipsoidSurfaceFunction(vec3\x20point)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20vec3\x20scaled\x20=\x20czm_ellipsoidInverseRadii\x20*\x20point;\x0d\x0a\x20\x20\x20\x20return\x20dot(scaled,\x20scaled)\x20-\x201.0;\x0d\x0a}\x0d\x0a\x0d\x0avoid\x20main()\x0d\x0a{\x0d\x0a\x20\x20\x20\x20vec3\x20sensorVertexWC\x20=\x20czm_model[3].xyz;\x20\x20\x20\x20\x20\x20//\x20(0.0,\x200.0,\x200.0)\x20in\x20model\x20coordinates\x0d\x0a\x20\x20\x20\x20vec3\x20sensorVertexEC\x20=\x20czm_modelView[3].xyz;\x20\x20//\x20(0.0,\x200.0,\x200.0)\x20in\x20model\x20coordinates\x0d\x0a\x0d\x0a\x20\x20\x20\x20//vec3\x20pixDir\x20=\x20normalize(v_position);\x0d\x0a\x20\x20\x20\x20float\x20positionX\x20=\x20v_position.x;\x0d\x0a\x20\x20\x20\x20float\x20positionY\x20=\x20v_position.y;\x0d\x0a\x20\x20\x20\x20float\x20positionZ\x20=\x20v_position.z;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20zDir\x20=\x20vec3(0.0,\x200.0,\x201.0);\x0d\x0a\x20\x20\x20\x20vec3\x20lineX\x20=\x20vec3(positionX,\x200\x20,positionZ);\x0d\x0a\x20\x20\x20\x20vec3\x20lineY\x20=\x20vec3(0,\x20positionY,\x20positionZ);\x0d\x0a\x20\x20\x20\x20float\x20resX\x20=\x20dot(normalize(lineX),\x20zDir);\x0d\x0a\x20\x20\x20\x20if(resX\x20<\x20cos(u_xHalfAngle)-0.00001){\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x20\x20\x20\x20float\x20resY\x20=\x20dot(normalize(lineY),\x20zDir);\x0d\x0a\x20\x20\x20\x20if(resY\x20<\x20cos(u_yHalfAngle)-0.00001){\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x0d\x0a\x20\x20\x20\x20float\x20ellipsoidValue\x20=\x20ellipsoidSurfaceFunction(v_positionWC);\x0d\x0a\x0d\x0a\x20\x20\x20\x20//\x20Occluded\x20by\x20the\x20ellipsoid?\x0d\x0a\x09if\x20(!u_showThroughEllipsoid)\x0d\x0a\x09{\x0d\x0a\x09\x20\x20\x20\x20//\x20Discard\x20if\x20in\x20the\x20ellipsoid\x0d\x0a\x09\x20\x20\x20\x20//\x20PERFORMANCE_IDEA:\x20A\x20coarse\x20check\x20for\x20ellipsoid\x20intersection\x20could\x20be\x20done\x20on\x20the\x20CPU\x20first.\x0d\x0a\x09\x20\x20\x20\x20if\x20(ellipsoidValue\x20<\x200.0)\x0d\x0a\x09\x20\x20\x20\x20{\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x09\x20\x20\x20\x20}\x0d\x0a\x0d\x0a\x09\x20\x20\x20\x20//\x20Discard\x20if\x20in\x20the\x20sensor\x27s\x20shadow\x0d\x0a\x09\x20\x20\x20\x20if\x20(inSensorShadow(sensorVertexWC,\x20v_positionWC))\x0d\x0a\x09\x20\x20\x20\x20{\x0d\x0a\x09\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x09\x20\x20\x20\x20}\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x0d\x0a\x20\x20\x20\x20//\x20Notes:\x20Each\x20surface\x20functions\x20should\x20have\x20an\x20associated\x20tolerance\x20based\x20on\x20the\x20floating\x20point\x20error.\x0d\x0a\x20\x20\x20\x20bool\x20isOnEllipsoid\x20=\x20isOnBoundary(ellipsoidValue,\x20czm_epsilon3);\x0d\x0a\x20\x20\x20\x20//isOnEllipsoid\x20=\x20false;\x0d\x0a\x20\x20\x20\x20//if((resX\x20>=\x200.8\x20&&\x20resX\x20<=\x200.81)||(resY\x20>=\x200.8\x20&&\x20resY\x20<=\x200.81)){\x0d\x0a\x20\x20\x20\x20/*if(false){\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20vec4(1.0,0.0,0.0,1.0);\x0d\x0a\x20\x20\x20\x20}else{\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20shade(isOnEllipsoid);\x0d\x0a\x20\x20\x20\x20}\x0d\x0a*/\x0d\x0a\x20\x20\x20\x20gl_FragColor\x20=\x20shade(isOnEllipsoid);\x0d\x0a\x0d\x0a}",
    YTBjN:
      "uniform\x20vec4\x20u_intersectionColor;\x0auniform\x20float\x20u_intersectionWidth;\x0auniform\x20vec4\x20u_lineColor;\x0a\x0abool\x20inSensorShadow(vec3\x20coneVertexWC,\x20vec3\x20pointWC)\x0a{\x0a\x20\x20\x20\x20//\x20Diagonal\x20matrix\x20from\x20the\x20unscaled\x20ellipsoid\x20space\x20to\x20the\x20scaled\x20space.\x20\x20\x20\x20\x0a\x20\x20\x20\x20vec3\x20D\x20=\x20czm_ellipsoidInverseRadii;\x0a\x0a\x20\x20\x20\x20//\x20Sensor\x20vertex\x20in\x20the\x20scaled\x20ellipsoid\x20space\x0a\x20\x20\x20\x20vec3\x20q\x20=\x20D\x20*\x20coneVertexWC;\x0a\x20\x20\x20\x20float\x20qMagnitudeSquared\x20=\x20dot(q,\x20q);\x0a\x20\x20\x20\x20float\x20test\x20=\x20qMagnitudeSquared\x20-\x201.0;\x0a\x20\x20\x20\x20\x0a\x20\x20\x20\x20//\x20Sensor\x20vertex\x20to\x20fragment\x20vector\x20in\x20the\x20ellipsoid\x27s\x20scaled\x20space\x0a\x20\x20\x20\x20vec3\x20temp\x20=\x20D\x20*\x20pointWC\x20-\x20q;\x0a\x20\x20\x20\x20float\x20d\x20=\x20dot(temp,\x20q);\x0a\x20\x20\x20\x20\x0a\x20\x20\x20\x20//\x20Behind\x20silhouette\x20plane\x20and\x20inside\x20silhouette\x20cone\x0a\x20\x20\x20\x20return\x20(d\x20<\x20-test)\x20&&\x20(d\x20/\x20length(temp)\x20<\x20-sqrt(test));\x0a}\x0a\x0a///////////////////////////////////////////////////////////////////////////////\x0a\x0avec4\x20getLineColor()\x0a{\x0a\x20\x20\x20\x20return\x20u_lineColor;\x0a}\x0a\x0avec4\x20getIntersectionColor()\x0a{\x0a\x20\x20\x20\x20return\x20u_intersectionColor;\x0a}\x0a\x0afloat\x20getIntersectionWidth()\x0a{\x0a\x20\x20\x20\x20return\x20u_intersectionWidth;\x0a}\x0a\x0avec2\x20sensor2dTextureCoordinates(float\x20sensorRadius,\x20vec3\x20pointMC)\x0a{\x0a\x20\x20\x20\x20//\x20(s,\x20t)\x20both\x20in\x20the\x20range\x20[0,\x201]\x0a\x20\x20\x20\x20float\x20t\x20=\x20pointMC.z\x20/\x20sensorRadius;\x0a\x20\x20\x20\x20float\x20s\x20=\x201.0\x20+\x20(atan(pointMC.y,\x20pointMC.x)\x20/\x20czm_twoPi);\x0a\x20\x20\x20\x20s\x20=\x20s\x20-\x20floor(s);\x0a\x20\x20\x20\x20\x0a\x20\x20\x20\x20return\x20vec2(s,\x20t);\x0a}\x0a",
    woqkz:
      "#ifdef\x20GL_OES_standard_derivatives\x0d\x0a#extension\x20GL_OES_standard_derivatives\x20:\x20enable\x0d\x0a#endif\x0d\x0a\x0d\x0auniform\x20bool\x20u_showIntersection;\x0d\x0auniform\x20bool\x20u_showThroughEllipsoid;\x0d\x0a\x0d\x0auniform\x20float\x20u_radius;\x0d\x0auniform\x20float\x20u_xHalfAngle;\x0d\x0auniform\x20float\x20u_yHalfAngle;\x0d\x0auniform\x20float\x20u_normalDirection;\x0d\x0auniform\x20vec4\x20u_color;\x0d\x0a\x0d\x0avarying\x20vec3\x20v_position;\x0d\x0avarying\x20vec3\x20v_positionWC;\x0d\x0avarying\x20vec3\x20v_positionEC;\x0d\x0avarying\x20vec3\x20v_normalEC;\x0d\x0a\x0d\x0avec4\x20getColor(float\x20sensorRadius,\x20vec3\x20pointEC)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20czm_materialInput\x20materialInput;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20pointMC\x20=\x20(czm_inverseModelView\x20*\x20vec4(pointEC,\x201.0)).xyz;\x0d\x0a\x20\x20\x20\x20materialInput.st\x20=\x20sensor2dTextureCoordinates(sensorRadius,\x20pointMC);\x0d\x0a\x20\x20\x20\x20materialInput.str\x20=\x20pointMC\x20/\x20sensorRadius;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20positionToEyeEC\x20=\x20-v_positionEC;\x0d\x0a\x20\x20\x20\x20materialInput.positionToEyeEC\x20=\x20positionToEyeEC;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20normalEC\x20=\x20normalize(v_normalEC);\x0d\x0a\x20\x20\x20\x20materialInput.normalEC\x20=\x20u_normalDirection\x20*\x20normalEC;\x0d\x0a\x0d\x0a\x20\x20\x20\x20czm_material\x20material\x20=\x20czm_getMaterial(materialInput);\x0d\x0a\x0d\x0a\x20\x20\x20\x20material.diffuse\x20=\x20u_color.rgb;\x0d\x0a\x20\x20\x20\x20material.alpha\x20=\x20u_color.a;\x0d\x0a\x0d\x0a\x20\x20\x20\x20return\x20mix(czm_phong(normalize(positionToEyeEC),\x20material,czm_lightDirectionEC),\x20vec4(material.diffuse,\x20material.alpha),\x200.4);\x0d\x0a\x0d\x0a}\x0d\x0a\x0d\x0abool\x20isOnBoundary(float\x20value,\x20float\x20epsilon)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20float\x20width\x20=\x20getIntersectionWidth();\x0d\x0a\x20\x20\x20\x20float\x20tolerance\x20=\x20width\x20*\x20epsilon;\x0d\x0a\x0d\x0a#ifdef\x20GL_OES_standard_derivatives\x0d\x0a\x20\x20\x20\x20float\x20delta\x20=\x20max(abs(dFdx(value)),\x20abs(dFdy(value)));\x0d\x0a\x20\x20\x20\x20float\x20pixels\x20=\x20width\x20*\x20delta;\x0d\x0a\x20\x20\x20\x20float\x20temp\x20=\x20abs(value);\x0d\x0a\x20\x20\x20\x20//\x20There\x20are\x20a\x20couple\x20things\x20going\x20on\x20here.\x0d\x0a\x20\x20\x20\x20//\x20First\x20we\x20test\x20the\x20value\x20at\x20the\x20current\x20fragment\x20to\x20see\x20if\x20it\x20is\x20within\x20the\x20tolerance.\x0d\x0a\x20\x20\x20\x20//\x20We\x20also\x20want\x20to\x20check\x20if\x20the\x20value\x20of\x20an\x20adjacent\x20pixel\x20is\x20within\x20the\x20tolerance,\x0d\x0a\x20\x20\x20\x20//\x20but\x20we\x20don\x27t\x20want\x20to\x20admit\x20points\x20that\x20are\x20obviously\x20not\x20on\x20the\x20surface.\x0d\x0a\x20\x20\x20\x20//\x20For\x20example,\x20if\x20we\x20are\x20looking\x20for\x20\x22value\x22\x20to\x20be\x20close\x20to\x200,\x20but\x20value\x20is\x201\x20and\x20the\x20adjacent\x20value\x20is\x202,\x0d\x0a\x20\x20\x20\x20//\x20then\x20the\x20delta\x20would\x20be\x201\x20and\x20\x22temp\x20-\x20delta\x22\x20would\x20be\x20\x221\x20-\x201\x22\x20which\x20is\x20zero\x20even\x20though\x20neither\x20of\x0d\x0a\x20\x20\x20\x20//\x20the\x20points\x20is\x20close\x20to\x20zero.\x0d\x0a\x20\x20\x20\x20return\x20temp\x20<\x20tolerance\x20&&\x20temp\x20<\x20pixels\x20||\x20(delta\x20<\x2010.0\x20*\x20tolerance\x20&&\x20temp\x20-\x20delta\x20<\x20tolerance\x20&&\x20temp\x20<\x20pixels);\x0d\x0a#else\x0d\x0a\x20\x20\x20\x20return\x20abs(value)\x20<\x20tolerance;\x0d\x0a#endif\x0d\x0a}\x0d\x0a\x0d\x0avec4\x20shade(bool\x20isOnBoundary)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20if\x20(u_showIntersection\x20&&\x20isOnBoundary)\x0d\x0a\x20\x20\x20\x20{\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20return\x20getIntersectionColor();\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x20\x20\x20\x20return\x20getColor(u_radius,\x20v_positionEC);\x0d\x0a}\x0d\x0a\x0d\x0afloat\x20ellipsoidSurfaceFunction(vec3\x20point)\x0d\x0a{\x0d\x0a\x20\x20\x20\x20vec3\x20scaled\x20=\x20czm_ellipsoidInverseRadii\x20*\x20point;\x0d\x0a\x20\x20\x20\x20return\x20dot(scaled,\x20scaled)\x20-\x201.0;\x0d\x0a}\x0d\x0a\x0d\x0avoid\x20main()\x0d\x0a{\x0d\x0a\x20\x20\x20\x20vec3\x20sensorVertexWC\x20=\x20czm_model[3].xyz;\x20\x20\x20\x20\x20\x20//\x20(0.0,\x200.0,\x200.0)\x20in\x20model\x20coordinates\x0d\x0a\x20\x20\x20\x20vec3\x20sensorVertexEC\x20=\x20czm_modelView[3].xyz;\x20\x20//\x20(0.0,\x200.0,\x200.0)\x20in\x20model\x20coordinates\x0d\x0a\x0d\x0a\x20\x20\x20\x20//vec3\x20pixDir\x20=\x20normalize(v_position);\x0d\x0a\x20\x20\x20\x20float\x20positionX\x20=\x20v_position.x;\x0d\x0a\x20\x20\x20\x20float\x20positionY\x20=\x20v_position.y;\x0d\x0a\x20\x20\x20\x20float\x20positionZ\x20=\x20v_position.z;\x0d\x0a\x0d\x0a\x20\x20\x20\x20vec3\x20zDir\x20=\x20vec3(0.0,\x200.0,\x201.0);\x0d\x0a\x20\x20\x20\x20vec3\x20lineX\x20=\x20vec3(positionX,\x200\x20,positionZ);\x0d\x0a\x20\x20\x20\x20vec3\x20lineY\x20=\x20vec3(0,\x20positionY,\x20positionZ);\x0d\x0a\x20\x20\x20\x20float\x20resX\x20=\x20dot(normalize(lineX),\x20zDir);\x0d\x0a\x20\x20\x20\x20if(resX\x20<\x20cos(u_xHalfAngle)\x20-\x200.0001){\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x20\x20\x20\x20float\x20resY\x20=\x20dot(normalize(lineY),\x20zDir);\x0d\x0a\x20\x20\x20\x20if(resY\x20<\x20cos(u_yHalfAngle)-\x200.0001){\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x0d\x0a\x20\x20\x20\x20float\x20ellipsoidValue\x20=\x20ellipsoidSurfaceFunction(v_positionWC);\x0d\x0a\x0d\x0a\x20\x20\x20\x20//\x20Occluded\x20by\x20the\x20ellipsoid?\x0d\x0a\x09if\x20(!u_showThroughEllipsoid)\x0d\x0a\x09{\x0d\x0a\x09\x20\x20\x20\x20//\x20Discard\x20if\x20in\x20the\x20ellipsoid\x0d\x0a\x09\x20\x20\x20\x20//\x20PERFORMANCE_IDEA:\x20A\x20coarse\x20check\x20for\x20ellipsoid\x20intersection\x20could\x20be\x20done\x20on\x20the\x20CPU\x20first.\x0d\x0a\x09\x20\x20\x20\x20if\x20(ellipsoidValue\x20<\x200.0)\x0d\x0a\x09\x20\x20\x20\x20{\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x09\x20\x20\x20\x20}\x0d\x0a\x0d\x0a\x09\x20\x20\x20\x20//\x20Discard\x20if\x20in\x20the\x20sensor\x27s\x20shadow\x0d\x0a\x09\x20\x20\x20\x20if\x20(inSensorShadow(sensorVertexWC,\x20v_positionWC))\x0d\x0a\x09\x20\x20\x20\x20{\x0d\x0a\x09\x20\x20\x20\x20\x20\x20\x20\x20discard;\x0d\x0a\x09\x20\x20\x20\x20}\x0d\x0a\x20\x20\x20\x20}\x0d\x0a\x0d\x0a\x20\x20\x20\x20//\x20Notes:\x20Each\x20surface\x20functions\x20should\x20have\x20an\x20associated\x20tolerance\x20based\x20on\x20the\x20floating\x20point\x20error.\x0d\x0a\x20\x20\x20\x20bool\x20isOnEllipsoid\x20=\x20isOnBoundary(ellipsoidValue,\x20czm_epsilon3);\x0d\x0a\x20\x20\x20\x20gl_FragColor\x20=\x20shade(isOnEllipsoid);\x0d\x0a\x0d\x0a}",
    wVvmT: function (_0x11303d, _0x24f557, _0x38e37d) {
      return _0x11303d(_0x24f557, _0x38e37d);
    },
    KoeaP: function (_0x4283b6, _0x1b9d99) {
      return _0x4283b6(_0x1b9d99);
    },
    QPDHW: "source\x20is\x20required.",
    elyPZ: function (_0x4a6443, _0x3cefcb, _0x36c1c1) {
      return _0x4a6443(_0x3cefcb, _0x36c1c1);
    },
    iJzOw: function (_0x57ed65, _0x235453, _0x11c233) {
      return _0x57ed65(_0x235453, _0x11c233);
    },
    vwzSd: function (_0x19fa92, _0x2eab46, _0x130c5c) {
      return _0x19fa92(_0x2eab46, _0x130c5c);
    },
    FsbZU: function (_0x855fb6, _0x5b0d59, _0x4b29dc) {
      return _0x855fb6(_0x5b0d59, _0x4b29dc);
    },
    dufEy: function (_0x7e9242, _0x1daa83) {
      return _0x7e9242(_0x1daa83);
    },
    MmUMe: "show",
    iNgiF: function (_0x3d599b, _0x3f6e97) {
      return _0x3d599b(_0x3f6e97);
    },
    IiPwE: "radius",
    qoqCY: function (_0x5d3a9b, _0x53ae0e) {
      return _0x5d3a9b(_0x53ae0e);
    },
    zAWHb: "xHalfAngle",
    FGTrU: "yHalfAngle",
    cFaHf: "lineColor",
    DjdiR: function (_0x5d5b73, _0x14e027) {
      return _0x5d5b73(_0x14e027);
    },
    LJMWl: "showSectorLines",
    VAmUJ: function (_0x3f0045, _0x5acd87) {
      return _0x3f0045(_0x5acd87);
    },
    XCFwx: "showSectorSegmentLines",
    FNGKK: "showLateralSurfaces",
    lPWEz: function (_0x2e1c81, _0x5dbdf5) {
      return _0x2e1c81(_0x5dbdf5);
    },
    eaEIp: "material",
    JApNn: function (_0x2a4230, _0x2ba906) {
      return _0x2a4230(_0x2ba906);
    },
    pyhEv: "showDomeSurfaces",
    aVUpi: "showDomeLines\x20",
    AiXjC: "showIntersection",
    STtxn: function (_0x2b42e7, _0x277641) {
      return _0x2b42e7(_0x277641);
    },
    pTqDa: "intersectionColor",
    UOjSG: function (_0x2ef496, _0x530eb3) {
      return _0x2ef496(_0x530eb3);
    },
    cWnxW: "intersectionWidth",
    OPnNJ: "showThroughEllipsoid",
    yoxUX: function (_0x470582, _0x4fedc8) {
      return _0x470582(_0x4fedc8);
    },
    aBUVY: "gaze",
    vJtEC: function (_0x296c20, _0x23a8a7) {
      return _0x296c20(_0x23a8a7);
    },
    PxTAB: "showScanPlane",
    auHYn: function (_0x24a27c, _0x512450) {
      return _0x24a27c(_0x512450);
    },
    PskaR: "scanPlaneColor",
    NAkWa: function (_0x3632a0, _0x34ea28) {
      return _0x3632a0(_0x34ea28);
    },
    ZQKDF: "scanPlaneMode",
    AgLdt: function (_0x4cffea, _0x450c14) {
      return _0x4cffea(_0x450c14);
    },
    rZWnc: "scanPlaneRate",
    vXmLv: function (_0x5d5bdb, _0x30cf95) {
      return _0x5d5bdb(_0x30cf95);
    },
    GrNht: "scene\x20is\x20required.",
    Zvmdh: "entityCollection\x20is\x20required.",
    pZTcR: "time\x20is\x20required.",
    dgCbO: "1|0|4|3|2",
    JrZsV: function (_0x249929, _0x4dc3c9) {
      return _0x249929(_0x4dc3c9);
    },
    DhCFm: function (_0x308695, _0x4befce) {
      return _0x308695(_0x4befce);
    },
    dgcuw: function (_0x313254, _0x5c8042) {
      return _0x313254(_0x5c8042);
    },
    xaliA: function (_0x383694, _0x4dabbb) {
      return _0x383694 - _0x4dabbb;
    },
    Ydstt: function (_0x75a009, _0x18ee61) {
      return _0x75a009 - _0x18ee61;
    },
    AWaOk: function (_0x47d15a, _0x50d423) {
      return _0x47d15a < _0x50d423;
    },
    nQPCE: function (_0x1f54d9, _0x13917c) {
      return _0x1f54d9(_0x13917c);
    },
    seISt: "3|4|2|0|5|1",
    UvVdV: function (_0x5e0941, _0x578a09) {
      return _0x5e0941(_0x578a09);
    },
    tibUF: function (_0x36f0d3, _0x1b4995) {
      return _0x36f0d3(_0x1b4995);
    },
    aNmFW: function (_0xb3216a, _0x182f41) {
      return _0xb3216a - _0x182f41;
    },
    zugUo: function (_0x546183, _0x3219cc) {
      return _0x546183(_0x3219cc);
    },
    TiQxB: function (_0x432033, _0x257543) {
      return _0x432033 < _0x257543;
    },
    yatBa: function (_0x2f394d, _0x4fbc68) {
      return _0x2f394d(_0x4fbc68);
    },
    kGgTI: function (_0x24b05f, _0x562247) {
      return _0x24b05f(_0x562247);
    },
  };
  return (function (_0x1dadfd) {
    var _0xa0c097 = {};

    function _0x2001d8(_0x38b463) {
      if (_0xa0c097[_0x38b463]) return _0xa0c097[_0x38b463]["exports"];
      var _0x16cf99 = (_0xa0c097[_0x38b463] = {
        i: _0x38b463,
        l: !0x1,
        exports: {},
      });
      return (
        _0x1dadfd[_0x38b463]["call"](
          _0x16cf99["exports"],
          _0x16cf99,
          _0x16cf99["exports"],
          _0x2001d8
        ),
        (_0x16cf99["l"] = !0x0),
        _0x16cf99["exports"]
      );
    }
    return (
      (_0x2001d8["m"] = _0x1dadfd),
      (_0x2001d8["c"] = _0xa0c097),
      (_0x2001d8["d"] = function (_0x510079, _0x4e3adf, _0x309369) {
        _0x2001d8["o"](_0x510079, _0x4e3adf) ||
          Object["defineProperty"](_0x510079, _0x4e3adf, {
            configurable: !0x1,
            enumerable: !0x0,
            get: _0x309369,
          });
      }),
      (_0x2001d8["n"] = function (_0xac75cc) {
        var _0x36c2ac =
          _0xac75cc && _0xac75cc["__esModule"]
            ? function () {
                return _0xac75cc["default"];
              }
            : function () {
                return _0xac75cc;
              };
        return _0x2001d8["d"](_0x36c2ac, "a", _0x36c2ac), _0x36c2ac;
      }),
      (_0x2001d8["o"] = function (_0x260705, _0x25b07c) {
        return Object["prototype"]["hasOwnProperty"]["call"](
          _0x260705,
          _0x25b07c
        );
      }),
      (_0x2001d8["p"] = ""),
      _0xea530e["czpQM"](_0x2001d8, (_0x2001d8["s"] = 0x2))
    );
  })([
    function (_0x603318, _0x439111) {
      _0x603318["exports"] = _0x3f3dfd;
    },
    function (_0x257cff, _0x7291b5, _0xf450b4) {
      var _0x2209ec = {
        qPYUI: _0xea530e["MnEec"],
        dJzLW: function (_0x46b228, _0x218e5c) {
          return _0xea530e["uwCLU"](_0x46b228, _0x218e5c);
        },
        vjwQD: function (_0xc25f5e, _0x43065c) {
          return _0xea530e["QffpP"](_0xc25f5e, _0x43065c);
        },
        TaPnc: function (_0x34464a, _0x51d683) {
          return _0xea530e["mFFtQ"](_0x34464a, _0x51d683);
        },
        uQEuW: function (_0x261ba4, _0x4cbafe) {
          return _0xea530e["AwaPT"](_0x261ba4, _0x4cbafe);
        },
        FLNbS: function (_0x312b40, _0x1beb8a) {
          return _0xea530e["UWvbN"](_0x312b40, _0x1beb8a);
        },
        WEiLZ: function (_0x357e59, _0x23b0c5, _0x1b7600, _0x1d3a0c) {
          return _0xea530e["NsfsI"](_0x357e59, _0x23b0c5, _0x1b7600, _0x1d3a0c);
        },
        VYHkf: function (_0x5dea5b, _0x55253a) {
          return _0xea530e["jYcTo"](_0x5dea5b, _0x55253a);
        },
        pCzbL: _0xea530e["VygMe"],
        nheBz: function (_0x366812, _0x25e95d, _0x11b4dd, _0x36b739) {
          return _0xea530e["WEGpU"](_0x366812, _0x25e95d, _0x11b4dd, _0x36b739);
        },
        FdoHu: function (_0x12c4f9, _0x182f60, _0x31fd0d) {
          return _0xea530e["qxOGH"](_0x12c4f9, _0x182f60, _0x31fd0d);
        },
        XprCT: function (_0x46a04d, _0x8250e5, _0x538afb, _0x12981f) {
          return _0xea530e["SLFSM"](_0x46a04d, _0x8250e5, _0x538afb, _0x12981f);
        },
        iezIj: function (_0xc03d67, _0x560cfe, _0x24864d) {
          return _0xea530e["fNksV"](_0xc03d67, _0x560cfe, _0x24864d);
        },
        HEtWp: _0xea530e["IYXVA"],
        IMaVU: function (
          _0x31de4f,
          _0x31634d,
          _0x3b9a8c,
          _0x5c7e1d,
          _0x18f65d,
          _0x3545d2,
          _0x2b9a5c,
          _0x30ab5b,
          _0x34be33,
          _0x571f41,
          _0x751c1a,
          _0x71d2b6
        ) {
          return _0xea530e["lOKbc"](
            _0x31de4f,
            _0x31634d,
            _0x3b9a8c,
            _0x5c7e1d,
            _0x18f65d,
            _0x3545d2,
            _0x2b9a5c,
            _0x30ab5b,
            _0x34be33,
            _0x571f41,
            _0x751c1a,
            _0x71d2b6
          );
        },
        dRJvN: function (
          _0x252327,
          _0x5debbc,
          _0x4e5580,
          _0x4349fb,
          _0x557fae,
          _0x43526e,
          _0x1fdd29,
          _0x51af51,
          _0x21caa6,
          _0x51369b,
          _0x15efa9,
          _0x5a3a8a,
          _0x4f6d85
        ) {
          return _0xea530e["VsmEJ"](
            _0x252327,
            _0x5debbc,
            _0x4e5580,
            _0x4349fb,
            _0x557fae,
            _0x43526e,
            _0x1fdd29,
            _0x51af51,
            _0x21caa6,
            _0x51369b,
            _0x15efa9,
            _0x5a3a8a,
            _0x4f6d85
          );
        },
        TrKXd: function (
          _0x131ae6,
          _0x4b3378,
          _0x18a562,
          _0x399db8,
          _0x42d0b6,
          _0x17de01,
          _0x1ce967,
          _0x163da7,
          _0xe84ac4,
          _0x2cc187,
          _0x46b1d2,
          _0x5dd489
        ) {
          return _0xea530e["lOKbc"](
            _0x131ae6,
            _0x4b3378,
            _0x18a562,
            _0x399db8,
            _0x42d0b6,
            _0x17de01,
            _0x1ce967,
            _0x163da7,
            _0xe84ac4,
            _0x2cc187,
            _0x46b1d2,
            _0x5dd489
          );
        },
        woXHV: _0xea530e["OBCdm"],
        tDRwm: function (_0x4d5690, _0x27692f) {
          return _0xea530e["lVppA"](_0x4d5690, _0x27692f);
        },
        CCXFA: function (_0x4ea453, _0x27587b) {
          return _0xea530e["QffpP"](_0x4ea453, _0x27587b);
        },
        jDpzi: function (_0x1576de, _0x54ee2e) {
          return _0xea530e["lVppA"](_0x1576de, _0x54ee2e);
        },
        iQbcf: function (_0x3b4678, _0x1cc262) {
          return _0xea530e["RyEfa"](_0x3b4678, _0x1cc262);
        },
        SlKVZ: function (_0x442164, _0x49d0d0) {
          return _0xea530e["DOUQa"](_0x442164, _0x49d0d0);
        },
        hkykN: _0xea530e["GxPlf"],
        qkLcR: function (_0x37d1c0, _0x3b7fe8) {
          return _0xea530e["dnIVN"](_0x37d1c0, _0x3b7fe8);
        },
        GhwyE: function (_0x1bb263, _0x285d43) {
          return _0xea530e["AGnYN"](_0x1bb263, _0x285d43);
        },
        GaaPd: _0xea530e["wnRok"],
        FjmRq: function (_0x25f002, _0x1fcfa8) {
          return _0xea530e["Qxjgf"](_0x25f002, _0x1fcfa8);
        },
        fnmdp: function (_0x36a5f3, _0x5f2531) {
          return _0xea530e["mGVKO"](_0x36a5f3, _0x5f2531);
        },
        vAaeX: _0xea530e["RpyBI"],
        sWyYm: function (_0x3efd26, _0x2f86d2) {
          return _0xea530e["aSiiy"](_0x3efd26, _0x2f86d2);
        },
        kwFBI: function (_0x279e76, _0x5a185b) {
          return _0xea530e["KcaCE"](_0x279e76, _0x5a185b);
        },
        bMxim: function (_0x2b039e, _0x186489) {
          return _0xea530e["CcUfv"](_0x2b039e, _0x186489);
        },
        TVoxs: _0xea530e["iYEIL"],
        QARuq: function (_0x3e49c4, _0x3924ee) {
          return _0xea530e["jYcTo"](_0x3e49c4, _0x3924ee);
        },
        DyGaK: function (_0xd8a09b, _0x4ed43b) {
          return _0xea530e["lOyiS"](_0xd8a09b, _0x4ed43b);
        },
        hiOsN: function (_0x317279, _0x620464) {
          return _0xea530e["uwCLU"](_0x317279, _0x620464);
        },
        CyAPe: function (_0x2866f5, _0x5dcff6) {
          return _0xea530e["DOUQa"](_0x2866f5, _0x5dcff6);
        },
        wfAcv: function (_0x5b2bdb, _0x40a838) {
          return _0xea530e["FJODi"](_0x5b2bdb, _0x40a838);
        },
        mmpSZ: function (_0x339873, _0x38cc08) {
          return _0xea530e["lOyiS"](_0x339873, _0x38cc08);
        },
        Mmvyi: function (_0x1b0afa, _0x3fb1ef) {
          return _0xea530e["BZzDj"](_0x1b0afa, _0x3fb1ef);
        },
        Qydlu: function (_0x407f0b, _0x659801) {
          return _0xea530e["lOyiS"](_0x407f0b, _0x659801);
        },
        MshOs: function (_0x3c4cf4, _0x581719) {
          return _0xea530e["tXoyj"](_0x3c4cf4, _0x581719);
        },
        RCHmr: function (_0x32831a, _0x15c963) {
          return _0xea530e["XqDfU"](_0x32831a, _0x15c963);
        },
        YtsLX: function (_0x3db721, _0x4f1fa4) {
          return _0xea530e["RenqP"](_0x3db721, _0x4f1fa4);
        },
        FomaR: function (_0x30a8d9, _0x5dcaaa) {
          return _0xea530e["XnteI"](_0x30a8d9, _0x5dcaaa);
        },
        lVovX: function (_0xe3160b, _0x56586d) {
          return _0xea530e["AGnYN"](_0xe3160b, _0x56586d);
        },
        LLtoD: _0xea530e["nQBWt"],
        gYivs: function (_0x157533, _0x45dcb7) {
          return _0xea530e["HYsPa"](_0x157533, _0x45dcb7);
        },
        HOMDj: function (_0x3c9c2e, _0xe0cf1c) {
          return _0xea530e["qIJyS"](_0x3c9c2e, _0xe0cf1c);
        },
        LDMnG: function (_0x3cc80c, _0x1b2fb5) {
          return _0xea530e["eShrj"](_0x3cc80c, _0x1b2fb5);
        },
        zvcse: function (_0x37d507, _0x13b39b) {
          return _0xea530e["eShrj"](_0x37d507, _0x13b39b);
        },
        vDjWt: function (_0x24e14f, _0x421212) {
          return _0xea530e["TGpuW"](_0x24e14f, _0x421212);
        },
        iYBef: function (_0x1ac811, _0x53563b) {
          return _0xea530e["XqDfU"](_0x1ac811, _0x53563b);
        },
        WEPQB: function (_0x2f7160, _0x919e47) {
          return _0xea530e["XnWfQ"](_0x2f7160, _0x919e47);
        },
        jMIJl: function (_0x3ef5a5, _0x52f57b) {
          return _0xea530e["BZzDj"](_0x3ef5a5, _0x52f57b);
        },
        ZkGTc: function (_0x2f7084, _0x36b064) {
          return _0xea530e["bwPFA"](_0x2f7084, _0x36b064);
        },
        hTwDw: function (_0x19ddcb, _0x2e98f2) {
          return _0xea530e["tFcxJ"](_0x19ddcb, _0x2e98f2);
        },
        xghCL: function (_0x1aaf38, _0x1d67e8) {
          return _0xea530e["XqDfU"](_0x1aaf38, _0x1d67e8);
        },
        MwTku: function (_0x3780b5, _0x229e63) {
          return _0xea530e["rIhYm"](_0x3780b5, _0x229e63);
        },
        dZZbK: function (_0x46bcae, _0x1137dd) {
          return _0xea530e["bwPFA"](_0x46bcae, _0x1137dd);
        },
        UDJnY: function (_0x1222e1, _0x576be2) {
          return _0xea530e["OGOAp"](_0x1222e1, _0x576be2);
        },
      };
      ("use strict");
      Object["defineProperty"](_0x7291b5, _0xea530e["JNTyN"], {
        value: !0x0,
      }),
        (_0x7291b5["RectangularSensorPrimitive"] = void 0x0);
      var _0x28f56b = _0xea530e["UTqFL"](
          _0x5e93f6,
          _0xea530e["UTqFL"](_0xf450b4, 0x0)
        ),
        _0x1e5820 = _0xea530e["FrdhQ"](
          _0x5e93f6,
          _0xea530e["kUDkF"](_0xf450b4, 0x3)
        ),
        _0x17acbc = _0xea530e["kUDkF"](
          _0x5e93f6,
          _0xea530e["kUDkF"](_0xf450b4, 0x4)
        ),
        _0x49d1e3 = _0xea530e["LmKVx"](
          _0x5e93f6,
          _0xea530e["LmKVx"](_0xf450b4, 0x5)
        ),
        _0x28f1bf = _0xea530e["pFTyO"](
          _0x5e93f6,
          _0xea530e["yQmmt"](_0xf450b4, 0x6)
        );

      function _0x5e93f6(_0x407614) {
        return _0x407614 && _0x407614["__esModule"]
          ? _0x407614
          : {
              default: _0x407614,
            };
      }
      var _0x559f06 = _0x28f56b["BoundingSphere"],
        _0x73d3f6 = _0x28f56b["Cartesian3"],
        _0x44db1d = _0x28f56b["Color"],
        _0xd10611 = _0x28f56b["combine"],
        _0x9079f3 = _0x28f56b["ComponentDatatype"],
        _0x5ed6e0 = _0x28f56b["defaultValue"],
        _0x40710e = _0x28f56b["defined"],
        _0x18328e =
          (_0x28f56b["defineProperties"],
          _0x28f56b["destroyObject"],
          _0x28f56b["DeveloperError"]),
        _0x137178 = _0x28f56b["Matrix4"],
        _0x35dd67 = _0x28f56b["PrimitiveType"],
        _0x2b0377 = _0x28f56b["Buffer"],
        _0x20568e = _0x28f56b["BufferUsage"],
        _0x100ad7 = _0x28f56b["DrawCommand"],
        _0x258ae0 = _0x28f56b["Pass"],
        _0xb8c49d = _0x28f56b["RenderState"],
        _0x367be2 = _0x28f56b["ShaderProgram"],
        _0x2f86d7 = _0x28f56b["ShaderSource"],
        _0x3b6de9 = _0x28f56b["VertexArray"],
        _0x3c7483 = _0x28f56b["BlendingState"],
        _0xf73392 = _0x28f56b["CullFace"],
        _0x3d1e03 = _0x28f56b["Material"],
        _0x461836 = _0x28f56b["SceneMode"],
        _0x50b4db = _0x28f56b["VertexFormat"],
        _0x47ea53 = _0x28f56b["Math"],
        _0x2866d1 = _0x28f56b["Matrix3"],
        _0x3a0c68 =
          ((_0x137178 = _0x28f56b["Matrix4"]), _0x28f56b["JulianDate"]),
        _0x59d9ee =
          (_0x28f56b["BoxGeometry"],
          _0x28f56b["EllipsoidGeometry"],
          Math["sin"]),
        _0x186ec4 = Math["cos"],
        _0xc35c05 = Math["tan"],
        _0x2f841a = Math["atan"],
        _0x57188f =
          (Math["asin"],
          {
            position: 0x0,
            normal: 0x1,
          });

      function _0x1c6d03(_0x41a772) {
        var _0x7291b5 = this;
        (_0x41a772 = _0xea530e["uBssY"](
          _0x5ed6e0,
          _0x41a772,
          _0x5ed6e0["EMPTY_OBJECT"]
        )),
          (this["show"] = _0xea530e["xjDCe"](
            _0x5ed6e0,
            _0x41a772["show"],
            !0x0
          )),
          (this["slice"] = _0xea530e["tVktx"](
            _0x5ed6e0,
            _0x41a772["slice"],
            0x20
          )),
          (this["modelMatrix"] = _0x137178["clone"](
            _0x41a772["modelMatrix"],
            new _0x137178()
          )),
          (this["_modelMatrix"] = new _0x137178()),
          (this["_computedModelMatrix"] = new _0x137178()),
          (this["_computedScanPlaneModelMatrix"] = new _0x137178()),
          (this["radius"] = _0xea530e["scWtJ"](
            _0x5ed6e0,
            _0x41a772["radius"],
            Number["POSITIVE_INFINITY"]
          )),
          (this["_radius"] = void 0x0),
          (this["xHalfAngle"] = _0xea530e["gUJuw"](
            _0x5ed6e0,
            _0x41a772["xHalfAngle"],
            0x0
          )),
          (this["_xHalfAngle"] = void 0x0),
          (this["yHalfAngle"] = _0xea530e["nDahB"](
            _0x5ed6e0,
            _0x41a772["yHalfAngle"],
            0x0
          )),
          (this["_yHalfAngle"] = void 0x0),
          (this["lineColor"] = _0xea530e["LCjaL"](
            _0x5ed6e0,
            _0x41a772["lineColor"],
            _0x44db1d["WHITE"]
          )),
          (this["showSectorLines"] = _0xea530e["LCjaL"](
            _0x5ed6e0,
            _0x41a772["showSectorLines"],
            !0x0
          )),
          (this["showSectorSegmentLines"] = _0xea530e["YpRpU"](
            _0x5ed6e0,
            _0x41a772["showSectorSegmentLines"],
            !0x0
          )),
          (this["showLateralSurfaces"] = _0xea530e["YpRpU"](
            _0x5ed6e0,
            _0x41a772["showLateralSurfaces"],
            !0x0
          )),
          (this["material"] = _0xea530e["czpQM"](
            _0x40710e,
            _0x41a772["material"]
          )
            ? _0x41a772["material"]
            : _0x3d1e03["fromType"](_0x3d1e03["ColorType"])),
          (this["_material"] = void 0x0),
          (this["_translucent"] = void 0x0),
          (this["lateralSurfaceMaterial"] = _0xea530e["CtQAZ"](
            _0x40710e,
            _0x41a772["lateralSurfaceMaterial"]
          )
            ? _0x41a772["lateralSurfaceMaterial"]
            : _0x3d1e03["fromType"](_0x3d1e03["ColorType"])),
          (this["_lateralSurfaceMaterial"] = void 0x0),
          (this["_lateralSurfaceTranslucent"] = void 0x0),
          (this["showDomeSurfaces"] = _0xea530e["YpRpU"](
            _0x5ed6e0,
            _0x41a772["showDomeSurfaces"],
            !0x0
          )),
          (this["domeSurfaceMaterial"] = _0xea530e["lOyiS"](
            _0x40710e,
            _0x41a772["domeSurfaceMaterial"]
          )
            ? _0x41a772["domeSurfaceMaterial"]
            : _0x3d1e03["fromType"](_0x3d1e03["ColorType"])),
          (this["_domeSurfaceMaterial"] = void 0x0),
          (this["showDomeLines"] = _0xea530e["TWgRf"](
            _0x5ed6e0,
            _0x41a772["showDomeLines"],
            !0x0
          )),
          (this["showIntersection"] = _0xea530e["IhvSk"](
            _0x5ed6e0,
            _0x41a772["showIntersection"],
            !0x0
          )),
          (this["intersectionColor"] = _0xea530e["IhvSk"](
            _0x5ed6e0,
            _0x41a772["intersectionColor"],
            _0x44db1d["WHITE"]
          )),
          (this["intersectionWidth"] = _0xea530e["hvNmI"](
            _0x5ed6e0,
            _0x41a772["intersectionWidth"],
            0x5
          )),
          (this["showThroughEllipsoid"] = _0xea530e["hvNmI"](
            _0x5ed6e0,
            _0x41a772["showThroughEllipsoid"],
            !0x1
          )),
          (this["_showThroughEllipsoid"] = void 0x0),
          (this["showScanPlane"] = _0xea530e["BYosh"](
            _0x5ed6e0,
            _0x41a772["showScanPlane"],
            !0x0
          )),
          (this["scanPlaneColor"] = _0xea530e["BYosh"](
            _0x5ed6e0,
            _0x41a772["scanPlaneColor"],
            _0x44db1d["WHITE"]
          )),
          (this["scanPlaneMode"] = _0xea530e["qxOGH"](
            _0x5ed6e0,
            _0x41a772["scanPlaneMode"],
            _0xea530e["VygMe"]
          )),
          (this["scanPlaneRate"] = _0xea530e["qxOGH"](
            _0x5ed6e0,
            _0x41a772["scanPlaneRate"],
            0xa
          )),
          (this["_scanePlaneXHalfAngle"] = 0x0),
          (this["_scanePlaneYHalfAngle"] = 0x0),
          (this["_time"] = _0x3a0c68["now"]()),
          (this["_boundingSphere"] = new _0x559f06()),
          (this["_boundingSphereWC"] = new _0x559f06()),
          (this["_sectorFrontCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["TRIANGLES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_sectorBackCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["TRIANGLES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_sectorVA"] = void 0x0),
          (this["_sectorLineCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["LINES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_sectorLineVA"] = void 0x0),
          (this["_sectorSegmentLineCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["LINES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_sectorSegmentLineVA"] = void 0x0),
          (this["_domeFrontCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["TRIANGLES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_domeBackCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["TRIANGLES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_domeVA"] = void 0x0),
          (this["_domeLineCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["LINES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_domeLineVA"] = void 0x0),
          (this["_scanPlaneFrontCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["TRIANGLES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_scanPlaneBackCommand"] = new _0x100ad7({
            owner: this,
            primitiveType: _0x35dd67["TRIANGLES"],
            boundingVolume: this["_boundingSphereWC"],
          })),
          (this["_scanRadialCommand"] = void 0x0),
          (this["_colorCommands"] = []),
          (this["_frontFaceRS"] = void 0x0),
          (this["_backFaceRS"] = void 0x0),
          (this["_sp"] = void 0x0),
          (this["_uniforms"] = {
            u_type: function () {
              return 0x0;
            },
            u_xHalfAngle: function () {
              return _0x7291b5["xHalfAngle"];
            },
            u_yHalfAngle: function () {
              return _0x7291b5["yHalfAngle"];
            },
            u_radius: function () {
              return _0x7291b5["radius"];
            },
            u_showThroughEllipsoid: function () {
              return _0x7291b5["showThroughEllipsoid"];
            },
            u_showIntersection: function () {
              return _0x7291b5["showIntersection"];
            },
            u_intersectionColor: function () {
              return _0x7291b5["intersectionColor"];
            },
            u_intersectionWidth: function () {
              return _0x7291b5["intersectionWidth"];
            },
            u_normalDirection: function () {
              return 0x1;
            },
            u_lineColor: function () {
              return _0x7291b5["lineColor"];
            },
          }),
          (this["_scanUniforms"] = {
            u_xHalfAngle: function () {
              return _0x7291b5["_scanePlaneXHalfAngle"];
            },
            u_yHalfAngle: function () {
              return _0x7291b5["_scanePlaneYHalfAngle"];
            },
            u_radius: function () {
              return _0x7291b5["radius"];
            },
            u_color: function () {
              return _0x7291b5["scanPlaneColor"];
            },
            u_showThroughEllipsoid: function () {
              return _0x7291b5["showThroughEllipsoid"];
            },
            u_showIntersection: function () {
              return _0x7291b5["showIntersection"];
            },
            u_intersectionColor: function () {
              return _0x7291b5["intersectionColor"];
            },
            u_intersectionWidth: function () {
              return _0x7291b5["intersectionWidth"];
            },
            u_normalDirection: function () {
              return 0x1;
            },
            u_lineColor: function () {
              return _0x7291b5["lineColor"];
            },
          });
      }
      _0x1c6d03["prototype"]["update"] = function (_0x2d7374) {
        var _0x5429e9 = {
          oPsXQ: _0x2209ec["woXHV"],
          lTXMF: function (_0x2f47f7, _0x3cdc24) {
            return _0x2209ec["vjwQD"](_0x2f47f7, _0x3cdc24);
          },
          AvHYl: function (_0x10c41a, _0x342471) {
            return _0x2209ec["tDRwm"](_0x10c41a, _0x342471);
          },
          eEaVo: function (_0x19a1b1, _0x4df1e0) {
            return _0x2209ec["CCXFA"](_0x19a1b1, _0x4df1e0);
          },
          NZgyb: function (_0x5968b3, _0x26c9fc) {
            return _0x2209ec["dJzLW"](_0x5968b3, _0x26c9fc);
          },
          JXFMC: function (_0x39c2a5, _0x477f73) {
            return _0x2209ec["tDRwm"](_0x39c2a5, _0x477f73);
          },
          nhOPZ: function (_0x579b38, _0x4275cb) {
            return _0x2209ec["dJzLW"](_0x579b38, _0x4275cb);
          },
          BKcCy: function (_0x11b578, _0x1576a6) {
            return _0x2209ec["jDpzi"](_0x11b578, _0x1576a6);
          },
          pkHTT: function (_0x2b12d8, _0x3a4903) {
            return _0x2209ec["FLNbS"](_0x2b12d8, _0x3a4903);
          },
          QVVtH: function (_0x3e0ede, _0x2c0905) {
            return _0x2209ec["iQbcf"](_0x3e0ede, _0x2c0905);
          },
          nfNXf: function (_0x56cc7b, _0xf3716d) {
            return _0x2209ec["iQbcf"](_0x56cc7b, _0xf3716d);
          },
          qhnfn: function (_0x24daa0, _0x3db12f) {
            return _0x2209ec["SlKVZ"](_0x24daa0, _0x3db12f);
          },
          xzkEl: _0x2209ec["hkykN"],
        };
        var _0x7291b5 = _0x2d7374["mode"];
        if (
          this["show"] &&
          _0x2209ec["qkLcR"](_0x7291b5, _0x461836["SCENE3D"])
        ) {
          var _0xf450b4 = !0x1,
            _0x5e93f6 = !0x1,
            _0x44db1d = !0x1,
            _0x5ed6e0 = this["xHalfAngle"],
            _0x40710e = this["yHalfAngle"];
          if (
            _0x2209ec["jDpzi"](_0x5ed6e0, 0x0) ||
            _0x2209ec["GhwyE"](_0x40710e, 0x0)
          )
            throw new _0x18328e(_0x2209ec["GaaPd"]);
          if (
            _0x2209ec["FjmRq"](0x0, _0x5ed6e0) &&
            _0x2209ec["fnmdp"](0x0, _0x40710e)
          ) {
            var _0x3f0810 = _0x2209ec["vAaeX"]["split"]("|"),
              _0x509826 = 0x0;
            while (!![]) {
              switch (_0x3f0810[_0x509826++]) {
                case "0":
                  _0x2209ec["sWyYm"](this["_material"], _0x1c6d03) &&
                    ((this["_material"] = _0x1c6d03),
                    (_0x44db1d = _0x5e93f6 = !0x0));
                  continue;
                case "1":
                  if (_0x56bd32["render"])
                    for (
                      var _0xdff867 = 0x0, _0xcfff3a = _0x35c68b["length"];
                      _0x2209ec["GhwyE"](_0xdff867, _0xcfff3a);
                      _0xdff867++
                    ) {
                      var _0x234938 = _0x35c68b[_0xdff867];
                      _0x11e4be["push"](_0x234938);
                    }
                  continue;
                case "2":
                  _0x2209ec["sWyYm"](
                    this["_showThroughEllipsoid"],
                    this["showThroughEllipsoid"]
                  ) &&
                    ((this["_showThroughEllipsoid"] = _0x3d1e03),
                    (_0x5e93f6 = !0x0));
                  continue;
                case "3":
                  var _0x11e4be = _0x2d7374["commandList"],
                    _0x56bd32 = _0x2d7374["passes"],
                    _0x35c68b = this["_colorCommands"];
                  continue;
                case "4":
                  var _0x102373 = _0x1c6d03["isTranslucent"]();
                  continue;
                case "5":
                  _0x2209ec["kwFBI"](this["_radius"], _0x35dd67) &&
                    ((_0x100ad7 = !0x0),
                    (this["_radius"] = _0x35dd67),
                    (this["_boundingSphere"] = new _0x559f06(
                      _0x73d3f6["ZERO"],
                      this["radius"]
                    ))),
                    (!_0x137178["equals"](
                      this["modelMatrix"],
                      this["_modelMatrix"]
                    ) ||
                      _0x100ad7) &&
                      (_0x137178["clone"](
                        this["modelMatrix"],
                        this["_modelMatrix"]
                      ),
                      _0x137178["multiplyByUniformScale"](
                        this["modelMatrix"],
                        this["radius"],
                        this["_computedModelMatrix"]
                      ),
                      _0x559f06["transform"](
                        this["_boundingSphere"],
                        this["modelMatrix"],
                        this["_boundingSphereWC"]
                      ));
                  continue;
                case "6":
                  if (
                    (_0x2209ec["bMxim"](this["_translucent"], _0x102373) &&
                      ((this["_translucent"] = _0x102373), (_0x5e93f6 = !0x0)),
                    this["showScanPlane"])
                  ) {
                    var _0x1868de = _0x2209ec["TVoxs"]["split"]("|"),
                      _0xe4906b = 0x0;
                    while (!![]) {
                      switch (_0x1868de[_0xe4906b++]) {
                        case "0":
                          _0x2209ec["GhwyE"](_0x2b82d5, 0x0) &&
                            (this["_time"] = _0x3a0c68["clone"](
                              _0xd10611,
                              this["_time"]
                            ));
                          continue;
                        case "1":
                          if (
                            _0x2209ec["QARuq"](
                              _0x2209ec["pCzbL"],
                              this["scanPlaneMode"]
                            )
                          ) {
                            var _0x22ec4e = _0x2209ec["DyGaK"](
                                _0x186ec4,
                                (_0x59d9ee = _0x2209ec["hiOsN"](
                                  _0x2209ec["CyAPe"](
                                    _0x2209ec["wfAcv"](0x2, _0x40710e),
                                    _0x1c4a6f
                                  ),
                                  _0x40710e
                                ))
                              ),
                              _0x436b87 = _0x2209ec["mmpSZ"](
                                _0xc35c05,
                                _0x5ed6e0
                              ),
                              _0x583002 = _0x2209ec["mmpSZ"](
                                _0x2f841a,
                                _0x2209ec["wfAcv"](_0x22ec4e, _0x436b87)
                              );
                            (this["_scanePlaneXHalfAngle"] = _0x583002),
                              (this["_scanePlaneYHalfAngle"] = _0x59d9ee),
                              _0x28f56b["Matrix3"]["fromRotationX"](
                                this["_scanePlaneYHalfAngle"],
                                _0x53f379
                              );
                          } else {
                            _0x59d9ee = _0x2209ec["Mmvyi"](
                              _0x2209ec["wfAcv"](
                                _0x2209ec["wfAcv"](0x2, _0x5ed6e0),
                                _0x1c4a6f
                              ),
                              _0x5ed6e0
                            );
                            var _0x5341dc = _0x2209ec["mmpSZ"](
                                _0xc35c05,
                                _0x40710e
                              ),
                              _0x3db102 = _0x2209ec["Qydlu"](
                                _0x186ec4,
                                _0x59d9ee
                              ),
                              _0x1c2147 = _0x2209ec["Qydlu"](
                                _0x2f841a,
                                _0x2209ec["MshOs"](_0x3db102, _0x5341dc)
                              );
                            (this["_scanePlaneXHalfAngle"] = _0x59d9ee),
                              (this["_scanePlaneYHalfAngle"] = _0x1c2147),
                              _0x28f56b["Matrix3"]["fromRotationY"](
                                this["_scanePlaneXHalfAngle"],
                                _0x53f379
                              );
                          }
                          continue;
                        case "2":
                          var _0xd10611 = _0x2d7374["time"],
                            _0x2b82d5 = _0x3a0c68["secondsDifference"](
                              _0xd10611,
                              this["_time"]
                            );
                          continue;
                        case "3":
                          var _0x59d9ee,
                            _0x1c4a6f = Math["max"](
                              _0x2209ec["RCHmr"](
                                _0x2209ec["YtsLX"](
                                  _0x2b82d5,
                                  this["scanPlaneRate"]
                                ),
                                this["scanPlaneRate"]
                              ),
                              0x0
                            );
                          continue;
                        case "4":
                          _0x28f56b["Matrix4"]["multiplyByMatrix3"](
                            this["modelMatrix"],
                            _0x53f379,
                            this["_computedScanPlaneModelMatrix"]
                          ),
                            _0x137178["multiplyByUniformScale"](
                              this["_computedScanPlaneModelMatrix"],
                              this["radius"],
                              this["_computedScanPlaneModelMatrix"]
                            );
                          continue;
                      }
                      break;
                    }
                  }
                  continue;
                case "7":
                  var _0x100ad7 = !0x1;
                  continue;
                case "8":
                  var _0x1c6d03 = this["material"];
                  continue;
                case "9":
                  (_0x2209ec["qkLcR"](this["_xHalfAngle"], _0x5ed6e0) &&
                    _0x2209ec["qkLcR"](this["_yHalfAngle"], _0x40710e)) ||
                    ((this["_xHalfAngle"] = _0x5ed6e0),
                    (this["_yHalfAngle"] = _0x40710e),
                    (_0xf450b4 = !0x0));
                  continue;
                case "10":
                  _0xf450b4 &&
                    (function (_0x2e9eae, _0x4fe5e8) {
                      var _0x3c10c7 = _0x2209ec["qPYUI"]["split"]("|"),
                        _0x15222c = 0x0;
                      while (!![]) {
                        switch (_0x3c10c7[_0x15222c++]) {
                          case "0":
                            _0x2e9eae["showSectorSegmentLines"] &&
                              (_0x2e9eae["_sectorSegmentLineVA"] = (function (
                                _0x405801,
                                _0x3bc553
                              ) {
                                for (
                                  var _0xf450b4 = _0x5429e9["NZgyb"](
                                      Array["prototype"]["concat"]["apply"](
                                        [],
                                        _0x3bc553
                                      )["length"],
                                      _0x3bc553["length"]
                                    ),
                                    _0x5e93f6 = new Float32Array(
                                      _0x5429e9["eEaVo"](0x9, _0xf450b4)
                                    ),
                                    _0x44db1d = 0x0,
                                    _0x5ed6e0 = 0x0,
                                    _0x40710e = _0x3bc553["length"];
                                  _0x5429e9["JXFMC"](_0x5ed6e0, _0x40710e);
                                  _0x5ed6e0++
                                )
                                  for (
                                    var _0x35dd67 = _0x3bc553[_0x5ed6e0],
                                      _0x100ad7 = 0x0,
                                      _0xf450b4 = _0x5429e9["nhOPZ"](
                                        _0x35dd67["length"],
                                        0x1
                                      );
                                    _0x5429e9["BKcCy"](_0x100ad7, _0xf450b4);
                                    _0x100ad7++
                                  )
                                    (_0x5e93f6[_0x44db1d++] =
                                      _0x35dd67[_0x100ad7]["x"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[_0x100ad7]["y"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[_0x100ad7]["z"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[
                                          _0x5429e9["pkHTT"](_0x100ad7, 0x1)
                                        ]["x"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[
                                          _0x5429e9["QVVtH"](_0x100ad7, 0x1)
                                        ]["y"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[
                                          _0x5429e9["nfNXf"](_0x100ad7, 0x1)
                                        ]["z"]);
                                var _0x3d1e03 = _0x2b0377["createVertexBuffer"](
                                    {
                                      context: _0x405801,
                                      typedArray: _0x5e93f6,
                                      usage: _0x20568e["STATIC_DRAW"],
                                    }
                                  ),
                                  _0x1c6d03 = _0x5429e9["qhnfn"](
                                    0x3,
                                    Float32Array["BYTES_PER_ELEMENT"]
                                  ),
                                  _0x102373 = [
                                    {
                                      index: _0x57188f["position"],
                                      vertexBuffer: _0x3d1e03,
                                      componentsPerAttribute: 0x3,
                                      componentDatatype: _0x9079f3["FLOAT"],
                                      offsetInBytes: 0x0,
                                      strideInBytes: _0x1c6d03,
                                    },
                                  ];
                                return new _0x3b6de9({
                                  context: _0x405801,
                                  attributes: _0x102373,
                                });
                              })(_0xf450b4, _0x44db1d));
                            continue;
                          case "1":
                            _0x2e9eae["showLateralSurfaces"] &&
                              (_0x2e9eae["_sectorVA"] = (function (
                                _0x1f092e,
                                _0x5ac6f5
                              ) {
                                for (
                                  var _0xf450b4 = _0x5cc4c7["jKhLL"](
                                      Array["prototype"]["concat"]["apply"](
                                        [],
                                        _0x5ac6f5
                                      )["length"],
                                      _0x5ac6f5["length"]
                                    ),
                                    _0x5e93f6 = new Float32Array(
                                      _0x5cc4c7["WDYAm"](0x12, _0xf450b4)
                                    ),
                                    _0x44db1d = 0x0,
                                    _0x5ed6e0 = 0x0,
                                    _0x40710e = _0x5ac6f5["length"];
                                  _0x5cc4c7["ciRFV"](_0x5ed6e0, _0x40710e);
                                  _0x5ed6e0++
                                )
                                  for (
                                    var _0x35dd67 = _0x5ac6f5[_0x5ed6e0],
                                      _0x100ad7 = _0x73d3f6["normalize"](
                                        _0x73d3f6["cross"](
                                          _0x35dd67[0x0],
                                          _0x35dd67[
                                            _0x5cc4c7["jKhLL"](
                                              _0x35dd67["length"],
                                              0x1
                                            )
                                          ],
                                          _0x1e5f04
                                        ),
                                        _0x1e5f04
                                      ),
                                      _0x3d1e03 = 0x0,
                                      _0xf450b4 = _0x5cc4c7["ArqiP"](
                                        _0x35dd67["length"],
                                        0x1
                                      );
                                    _0x5cc4c7["ZheGa"](_0x3d1e03, _0xf450b4);
                                    _0x3d1e03++
                                  )
                                    (_0x5e93f6[_0x44db1d++] = 0x0),
                                      (_0x5e93f6[_0x44db1d++] = 0x0),
                                      (_0x5e93f6[_0x44db1d++] = 0x0),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["x"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["y"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["z"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[_0x3d1e03]["x"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[_0x3d1e03]["y"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[_0x3d1e03]["z"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["x"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["y"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["z"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[
                                          _0x5cc4c7["JsIpB"](_0x3d1e03, 0x1)
                                        ]["x"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[
                                          _0x5cc4c7["JsIpB"](_0x3d1e03, 0x1)
                                        ]["y"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        _0x35dd67[
                                          _0x5cc4c7["JsIpB"](_0x3d1e03, 0x1)
                                        ]["z"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["x"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["y"]),
                                      (_0x5e93f6[_0x44db1d++] =
                                        -_0x100ad7["z"]);
                                var _0x1c6d03 = _0x2b0377["createVertexBuffer"](
                                    {
                                      context: _0x1f092e,
                                      typedArray: _0x5e93f6,
                                      usage: _0x20568e["STATIC_DRAW"],
                                    }
                                  ),
                                  _0x102373 = _0x5cc4c7["lmFWa"](
                                    0x6,
                                    Float32Array["BYTES_PER_ELEMENT"]
                                  ),
                                  _0xd10611 = [
                                    {
                                      index: _0x57188f["position"],
                                      vertexBuffer: _0x1c6d03,
                                      componentsPerAttribute: 0x3,
                                      componentDatatype: _0x9079f3["FLOAT"],
                                      offsetInBytes: 0x0,
                                      strideInBytes: _0x102373,
                                    },
                                    {
                                      index: _0x57188f["normal"],
                                      vertexBuffer: _0x1c6d03,
                                      componentsPerAttribute: 0x3,
                                      componentDatatype: _0x9079f3["FLOAT"],
                                      offsetInBytes: _0x5cc4c7["lmFWa"](
                                        0x3,
                                        Float32Array["BYTES_PER_ELEMENT"]
                                      ),
                                      strideInBytes: _0x102373,
                                    },
                                  ];
                                return new _0x3b6de9({
                                  context: _0x1f092e,
                                  attributes: _0xd10611,
                                });
                              })(_0xf450b4, _0x44db1d));
                            continue;
                          case "2":
                            _0x2e9eae["showDomeLines"] &&
                              (_0x2e9eae["_domeLineVA"] = (function (
                                _0x3a2670
                              ) {
                                var _0x4fe5e8 = _0x28f56b[
                                  "EllipsoidOutlineGeometry"
                                ]["createGeometry"](
                                  new _0x28f56b["EllipsoidOutlineGeometry"]({
                                    vertexFormat: _0x50b4db["POSITION_ONLY"],
                                    stackPartitions: 0x20,
                                    slicePartitions: 0x20,
                                  })
                                );
                                return _0x3b6de9["fromGeometry"]({
                                  context: _0x3a2670,
                                  geometry: _0x4fe5e8,
                                  attributeLocations: _0x57188f,
                                  bufferUsage: _0x20568e["STATIC_DRAW"],
                                  interleave: !0x1,
                                });
                              })(_0xf450b4));
                            continue;
                          case "3":
                            var _0x5cc4c7 = {
                              jKhLL: function (_0xcdbd7, _0x2594ba) {
                                return _0x2209ec["dJzLW"](_0xcdbd7, _0x2594ba);
                              },
                              WDYAm: function (_0x195a08, _0x45903f) {
                                return _0x2209ec["vjwQD"](_0x195a08, _0x45903f);
                              },
                              ciRFV: function (_0x442264, _0x906842) {
                                return _0x2209ec["TaPnc"](_0x442264, _0x906842);
                              },
                              ArqiP: function (_0x4e0260, _0x5cc00e) {
                                return _0x2209ec["dJzLW"](_0x4e0260, _0x5cc00e);
                              },
                              ZheGa: function (_0x5b121f, _0x3b109a) {
                                return _0x2209ec["uQEuW"](_0x5b121f, _0x3b109a);
                              },
                              JsIpB: function (_0x542abd, _0xe3661e) {
                                return _0x2209ec["FLNbS"](_0x542abd, _0xe3661e);
                              },
                              lmFWa: function (_0x4490fc, _0xa5606c) {
                                return _0x2209ec["vjwQD"](_0x4490fc, _0xa5606c);
                              },
                            };
                            continue;
                          case "4":
                            _0x2e9eae["showDomeSurfaces"] &&
                              (_0x2e9eae["_domeVA"] = (function (_0x40e8b4) {
                                var _0x4fe5e8 = _0x28f56b["EllipsoidGeometry"][
                                  "createGeometry"
                                ](
                                  new _0x28f56b["EllipsoidGeometry"]({
                                    vertexFormat: _0x50b4db["POSITION_ONLY"],
                                    stackPartitions: 0x20,
                                    slicePartitions: 0x20,
                                  })
                                );
                                return _0x3b6de9["fromGeometry"]({
                                  context: _0x40e8b4,
                                  geometry: _0x4fe5e8,
                                  attributeLocations: _0x57188f,
                                  bufferUsage: _0x20568e["STATIC_DRAW"],
                                  interleave: !0x1,
                                });
                              })(_0xf450b4));
                            continue;
                          case "5":
                            var _0xf450b4 = _0x4fe5e8["context"],
                              _0x5e93f6 = _0x2209ec["WEiLZ"](
                                _0x33b610,
                                _0x2e9eae,
                                _0x2e9eae["xHalfAngle"],
                                _0x2e9eae["yHalfAngle"]
                              ),
                              _0x44db1d = (function (_0x13f7ef, _0x3490d1) {
                                var _0x1328f3 =
                                    _0x5429e9["oPsXQ"]["split"]("|"),
                                  _0x616295 = 0x0;
                                while (!![]) {
                                  switch (_0x1328f3[_0x616295++]) {
                                    case "0":
                                      _0x40710e["push"](
                                        _0x5ed6e0["map"](function (_0xd14d90) {
                                          return _0x2866d1["multiplyByVector"](
                                            _0x35dd67,
                                            _0xd14d90,
                                            new _0x28f56b["Cartesian3"]()
                                          );
                                        })["reverse"]()
                                      );
                                      continue;
                                    case "1":
                                      var _0x35dd67 = _0x2866d1[
                                        "fromRotationX"
                                      ](_0x5e93f6, _0x53f379);
                                      continue;
                                    case "2":
                                      return (
                                        _0x40710e["push"](
                                          _0x5ed6e0["map"](
                                            function (_0x13193b) {
                                              return _0x2866d1[
                                                "multiplyByVector"
                                              ](
                                                _0x35dd67,
                                                _0x13193b,
                                                new _0x28f56b["Cartesian3"]()
                                              );
                                            }
                                          )
                                        ),
                                        _0x40710e
                                      );
                                    case "3":
                                      var _0x35dd67 = _0x2866d1[
                                        "fromRotationY"
                                      ](-_0xf450b4, _0x53f379);
                                      continue;
                                    case "4":
                                      _0x40710e["push"](
                                        _0x44db1d["map"](function (_0x9a3fa8) {
                                          return _0x2866d1["multiplyByVector"](
                                            _0x35dd67,
                                            _0x9a3fa8,
                                            new _0x28f56b["Cartesian3"]()
                                          );
                                        })["reverse"]()
                                      );
                                      continue;
                                    case "5":
                                      var _0xf450b4 = _0x13f7ef["xHalfAngle"],
                                        _0x5e93f6 = _0x13f7ef["yHalfAngle"],
                                        _0x44db1d = _0x3490d1["zoy"],
                                        _0x5ed6e0 = _0x3490d1["zox"],
                                        _0x40710e = [],
                                        _0x35dd67 = _0x2866d1["fromRotationY"](
                                          _0xf450b4,
                                          _0x53f379
                                        );
                                      continue;
                                    case "6":
                                      _0x40710e["push"](
                                        _0x44db1d["map"](function (_0x1eac93) {
                                          return _0x2866d1["multiplyByVector"](
                                            _0x35dd67,
                                            _0x1eac93,
                                            new _0x28f56b["Cartesian3"]()
                                          );
                                        })
                                      );
                                      continue;
                                    case "7":
                                      var _0x35dd67 = _0x2866d1[
                                        "fromRotationX"
                                      ](-_0x5e93f6, _0x53f379);
                                      continue;
                                  }
                                  break;
                                }
                              })(_0x2e9eae, _0x5e93f6);
                            continue;
                          case "6":
                            _0x2e9eae["showSectorLines"] &&
                              (_0x2e9eae["_sectorLineVA"] = (function (
                                _0x1cc9d2,
                                _0x6a3c0c
                              ) {
                                for (
                                  var _0xf450b4 = _0x6a3c0c["length"],
                                    _0x5e93f6 = new Float32Array(
                                      _0x5429e9["lTXMF"](0x9, _0xf450b4)
                                    ),
                                    _0x44db1d = 0x0,
                                    _0x5ed6e0 = 0x0,
                                    _0x40710e = _0x6a3c0c["length"];
                                  _0x5429e9["AvHYl"](_0x5ed6e0, _0x40710e);
                                  _0x5ed6e0++
                                ) {
                                  var _0x35dd67 = _0x6a3c0c[_0x5ed6e0];
                                  (_0x5e93f6[_0x44db1d++] = 0x0),
                                    (_0x5e93f6[_0x44db1d++] = 0x0),
                                    (_0x5e93f6[_0x44db1d++] = 0x0),
                                    (_0x5e93f6[_0x44db1d++] =
                                      _0x35dd67[0x0]["x"]),
                                    (_0x5e93f6[_0x44db1d++] =
                                      _0x35dd67[0x0]["y"]),
                                    (_0x5e93f6[_0x44db1d++] =
                                      _0x35dd67[0x0]["z"]);
                                }
                                var _0x100ad7 = _0x2b0377["createVertexBuffer"](
                                    {
                                      context: _0x1cc9d2,
                                      typedArray: _0x5e93f6,
                                      usage: _0x20568e["STATIC_DRAW"],
                                    }
                                  ),
                                  _0x3d1e03 = _0x5429e9["eEaVo"](
                                    0x3,
                                    Float32Array["BYTES_PER_ELEMENT"]
                                  ),
                                  _0x1c6d03 = [
                                    {
                                      index: _0x57188f["position"],
                                      vertexBuffer: _0x100ad7,
                                      componentsPerAttribute: 0x3,
                                      componentDatatype: _0x9079f3["FLOAT"],
                                      offsetInBytes: 0x0,
                                      strideInBytes: _0x3d1e03,
                                    },
                                  ];
                                return new _0x3b6de9({
                                  context: _0x1cc9d2,
                                  attributes: _0x1c6d03,
                                });
                              })(_0xf450b4, _0x44db1d));
                            continue;
                          case "7":
                            if (_0x2e9eae["showScanPlane"])
                              if (
                                _0x2209ec["VYHkf"](
                                  _0x2209ec["pCzbL"],
                                  _0x2e9eae["scanPlaneMode"]
                                )
                              ) {
                                var _0x5ed6e0 = _0x2209ec["nheBz"](
                                  _0x33b610,
                                  _0x2e9eae,
                                  _0x47ea53["PI_OVER_TWO"],
                                  0x0
                                );
                                _0x2e9eae["_scanPlaneVA"] = _0x2209ec["FdoHu"](
                                  _0x17b89c,
                                  _0xf450b4,
                                  _0x5ed6e0["zox"]
                                );
                              } else {
                                var _0x5ed6e0 = _0x2209ec["XprCT"](
                                  _0x33b610,
                                  _0x2e9eae,
                                  0x0,
                                  _0x47ea53["PI_OVER_TWO"]
                                );
                                _0x2e9eae["_scanPlaneVA"] = _0x2209ec["iezIj"](
                                  _0x17b89c,
                                  _0xf450b4,
                                  _0x5ed6e0["zoy"]
                                );
                              }
                            continue;
                        }
                        break;
                      }
                    })(this, _0x2d7374),
                    _0x5e93f6 &&
                      (function (_0x1d329b, _0x55a03c, _0x5181bd) {
                        _0x5181bd
                          ? ((_0x1d329b["_frontFaceRS"] = _0xb8c49d[
                              "fromCache"
                            ]({
                              depthTest: {
                                enabled: !_0x55a03c,
                              },
                              depthMask: !0x1,
                              blending: _0x3c7483["ALPHA_BLEND"],
                              cull: {
                                enabled: !0x0,
                                face: _0xf73392["BACK"],
                              },
                            })),
                            (_0x1d329b["_backFaceRS"] = _0xb8c49d["fromCache"]({
                              depthTest: {
                                enabled: !_0x55a03c,
                              },
                              depthMask: !0x1,
                              blending: _0x3c7483["ALPHA_BLEND"],
                              cull: {
                                enabled: !0x0,
                                face: _0xf73392["FRONT"],
                              },
                            })),
                            (_0x1d329b["_pickRS"] = _0xb8c49d["fromCache"]({
                              depthTest: {
                                enabled: !_0x55a03c,
                              },
                              depthMask: !0x1,
                              blending: _0x3c7483["ALPHA_BLEND"],
                            })))
                          : ((_0x1d329b["_frontFaceRS"] = _0xb8c49d[
                              "fromCache"
                            ]({
                              depthTest: {
                                enabled: !_0x55a03c,
                              },
                              depthMask: !0x0,
                            })),
                            (_0x1d329b["_pickRS"] = _0xb8c49d["fromCache"]({
                              depthTest: {
                                enabled: !0x0,
                              },
                              depthMask: !0x0,
                            })));
                      })(this, _0x3d1e03, _0x102373),
                    _0x44db1d &&
                      (function (_0x32813f, _0x48d8c3, _0x571701) {
                        (function (_0x21bd4f, _0x35d7ee, _0x1f333d) {
                          var _0x5e93f6 = _0x35d7ee["context"],
                            _0x44db1d = _0x1e5820["default"],
                            _0x5ed6e0 = new _0x2f86d7({
                              sources: [
                                _0x49d1e3["default"],
                                _0x1f333d["shaderSource"],
                                _0x17acbc["default"],
                              ],
                            });
                          _0x21bd4f["_sp"] = _0x367be2["replaceCache"]({
                            context: _0x5e93f6,
                            shaderProgram: _0x21bd4f["_sp"],
                            vertexShaderSource: _0x44db1d,
                            fragmentShaderSource: _0x5ed6e0,
                            attributeLocations: _0x57188f,
                          });
                          var _0x40710e = new _0x2f86d7({
                            sources: [
                              _0x49d1e3["default"],
                              _0x1f333d["shaderSource"],
                              _0x17acbc["default"],
                            ],
                            pickColorQualifier: _0x5429e9["xzkEl"],
                          });
                          _0x21bd4f["_pickSP"] = _0x367be2["replaceCache"]({
                            context: _0x5e93f6,
                            shaderProgram: _0x21bd4f["_pickSP"],
                            vertexShaderSource: _0x44db1d,
                            fragmentShaderSource: _0x40710e,
                            attributeLocations: _0x57188f,
                          });
                        })(_0x32813f, _0x48d8c3, _0x571701),
                          _0x32813f["showScanPlane"] &&
                            (function (_0x2c722d, _0x170d55, _0xbd9bb3) {
                              var _0x5e93f6 = _0x170d55["context"],
                                _0x44db1d = _0x1e5820["default"],
                                _0x5ed6e0 = new _0x2f86d7({
                                  sources: [
                                    _0x49d1e3["default"],
                                    _0xbd9bb3["shaderSource"],
                                    _0x28f1bf["default"],
                                  ],
                                });
                              _0x2c722d["_scanePlaneSP"] = _0x367be2[
                                "replaceCache"
                              ]({
                                context: _0x5e93f6,
                                shaderProgram: _0x2c722d["_scanePlaneSP"],
                                vertexShaderSource: _0x44db1d,
                                fragmentShaderSource: _0x5ed6e0,
                                attributeLocations: _0x57188f,
                              });
                            })(_0x32813f, _0x48d8c3, _0x571701);
                      })(this, _0x2d7374, _0x1c6d03),
                    _0x2209ec["FomaR"](_0x5e93f6, _0x44db1d) &&
                      (function (_0x3d0d9b, _0x54e4ad) {
                        var _0x2900de = _0x2209ec["HEtWp"]["split"]("|"),
                          _0x3108b7 = 0x0;
                        while (!![]) {
                          switch (_0x2900de[_0x3108b7++]) {
                            case "0":
                              _0x3d0d9b["showDomeSurfaces"] &&
                                _0x2209ec["IMaVU"](
                                  _0x4b06e4,
                                  _0x3d0d9b,
                                  _0x3d0d9b["_domeFrontCommand"],
                                  _0x3d0d9b["_domeBackCommand"],
                                  _0x3d0d9b["_frontFaceRS"],
                                  _0x3d0d9b["_backFaceRS"],
                                  _0x3d0d9b["_sp"],
                                  _0x3d0d9b["_domeVA"],
                                  _0x3d0d9b["_uniforms"],
                                  _0x3d0d9b["_computedModelMatrix"],
                                  _0x54e4ad,
                                  _0xf450b4
                                );
                              continue;
                            case "1":
                              _0x3d0d9b["showSectorLines"] &&
                                _0x2209ec["dRJvN"](
                                  _0x4b06e4,
                                  _0x3d0d9b,
                                  _0x3d0d9b["_sectorLineCommand"],
                                  void 0x0,
                                  _0x3d0d9b["_frontFaceRS"],
                                  _0x3d0d9b["_backFaceRS"],
                                  _0x3d0d9b["_sp"],
                                  _0x3d0d9b["_sectorLineVA"],
                                  _0x3d0d9b["_uniforms"],
                                  _0x3d0d9b["_computedModelMatrix"],
                                  _0x54e4ad,
                                  _0xf450b4,
                                  !0x0
                                );
                              continue;
                            case "2":
                              _0x3d0d9b["showScanPlane"] &&
                                _0x2209ec["IMaVU"](
                                  _0x4b06e4,
                                  _0x3d0d9b,
                                  _0x3d0d9b["_scanPlaneFrontCommand"],
                                  _0x3d0d9b["_scanPlaneBackCommand"],
                                  _0x3d0d9b["_frontFaceRS"],
                                  _0x3d0d9b["_backFaceRS"],
                                  _0x3d0d9b["_scanePlaneSP"],
                                  _0x3d0d9b["_scanPlaneVA"],
                                  _0x3d0d9b["_scanUniforms"],
                                  _0x3d0d9b["_computedScanPlaneModelMatrix"],
                                  _0x54e4ad,
                                  _0xf450b4
                                );
                              continue;
                            case "3":
                              _0x3d0d9b["_colorCommands"]["length"] = 0x0;
                              continue;
                            case "4":
                              _0x3d0d9b["showSectorSegmentLines"] &&
                                _0x2209ec["dRJvN"](
                                  _0x4b06e4,
                                  _0x3d0d9b,
                                  _0x3d0d9b["_sectorSegmentLineCommand"],
                                  void 0x0,
                                  _0x3d0d9b["_frontFaceRS"],
                                  _0x3d0d9b["_backFaceRS"],
                                  _0x3d0d9b["_sp"],
                                  _0x3d0d9b["_sectorSegmentLineVA"],
                                  _0x3d0d9b["_uniforms"],
                                  _0x3d0d9b["_computedModelMatrix"],
                                  _0x54e4ad,
                                  _0xf450b4,
                                  !0x0
                                );
                              continue;
                            case "5":
                              _0x3d0d9b["showDomeLines"] &&
                                _0x2209ec["dRJvN"](
                                  _0x4b06e4,
                                  _0x3d0d9b,
                                  _0x3d0d9b["_domeLineCommand"],
                                  void 0x0,
                                  _0x3d0d9b["_frontFaceRS"],
                                  _0x3d0d9b["_backFaceRS"],
                                  _0x3d0d9b["_sp"],
                                  _0x3d0d9b["_domeLineVA"],
                                  _0x3d0d9b["_uniforms"],
                                  _0x3d0d9b["_computedModelMatrix"],
                                  _0x54e4ad,
                                  _0xf450b4,
                                  !0x0
                                );
                              continue;
                            case "6":
                              _0x3d0d9b["showLateralSurfaces"] &&
                                _0x2209ec["TrKXd"](
                                  _0x4b06e4,
                                  _0x3d0d9b,
                                  _0x3d0d9b["_sectorFrontCommand"],
                                  _0x3d0d9b["_sectorBackCommand"],
                                  _0x3d0d9b["_frontFaceRS"],
                                  _0x3d0d9b["_backFaceRS"],
                                  _0x3d0d9b["_sp"],
                                  _0x3d0d9b["_sectorVA"],
                                  _0x3d0d9b["_uniforms"],
                                  _0x3d0d9b["_computedModelMatrix"],
                                  _0x54e4ad,
                                  _0xf450b4
                                );
                              continue;
                            case "7":
                              var _0xf450b4 = _0x54e4ad
                                ? _0x258ae0["TRANSLUCENT"]
                                : _0x258ae0["OPAQUE"];
                              continue;
                          }
                          break;
                        }
                      })(this, _0x102373);
                  continue;
                case "11":
                  if (_0x2209ec["lVovX"](_0x35dd67, 0x0))
                    throw new _0x18328e(_0x2209ec["LLtoD"]);
                  continue;
                case "12":
                  var _0x3d1e03 = this["showThroughEllipsoid"];
                  continue;
                case "13":
                  var _0x35dd67 = this["radius"];
                  continue;
              }
              break;
            }
          }
        }
      };
      var _0x53f379 = new _0x2866d1(),
        _0x1e5f04 = new _0x73d3f6();

      function _0x33b610(_0x6293f8, _0x36f466, _0x3d0e4f) {
        for (
          var _0x5e93f6 = _0x6293f8["slice"],
            _0x44db1d = _0x2209ec["gYivs"](_0x186ec4, _0x3d0e4f),
            _0x5ed6e0 = _0x2209ec["HOMDj"](_0xc35c05, _0x3d0e4f),
            _0x40710e = _0x2209ec["HOMDj"](_0x186ec4, _0x36f466),
            _0x35dd67 = _0x2209ec["LDMnG"](_0xc35c05, _0x36f466),
            _0x100ad7 = _0x2209ec["LDMnG"](
              _0x2f841a,
              _0x2209ec["MshOs"](_0x40710e, _0x5ed6e0)
            ),
            _0x3d1e03 = _0x2209ec["zvcse"](
              _0x2f841a,
              _0x2209ec["vDjWt"](_0x44db1d, _0x35dd67)
            ),
            _0x1c6d03 = [],
            _0x1c6a53 = 0x0;
          _0x2209ec["lVovX"](_0x1c6a53, _0x5e93f6);
          _0x1c6a53++
        ) {
          var _0xd10611 = _0x2209ec["Mmvyi"](
            _0x2209ec["iYBef"](
              _0x2209ec["WEPQB"](_0x2209ec["WEPQB"](0x2, _0x100ad7), _0x1c6a53),
              _0x2209ec["jMIJl"](_0x5e93f6, 0x1)
            ),
            _0x100ad7
          );
          _0x1c6d03["push"](
            new _0x73d3f6(
              0x0,
              _0x2209ec["ZkGTc"](_0x59d9ee, _0xd10611),
              _0x2209ec["ZkGTc"](_0x186ec4, _0xd10611)
            )
          );
        }
        var _0xe5bb62 = [];
        for (
          _0x1c6a53 = 0x0;
          _0x2209ec["lVovX"](_0x1c6a53, _0x5e93f6);
          _0x1c6a53++
        ) {
          _0xd10611 = _0x2209ec["hTwDw"](
            _0x2209ec["xghCL"](
              _0x2209ec["WEPQB"](_0x2209ec["MwTku"](0x2, _0x3d1e03), _0x1c6a53),
              _0x2209ec["hTwDw"](_0x5e93f6, 0x1)
            ),
            _0x3d1e03
          );
          _0xe5bb62["push"](
            new _0x73d3f6(
              _0x2209ec["dZZbK"](_0x59d9ee, _0xd10611),
              0x0,
              _0x2209ec["UDJnY"](_0x186ec4, _0xd10611)
            )
          );
        }
        return {
          zoy: _0x1c6d03,
          zox: _0xe5bb62,
        };
      }

      function _0x17b89c(_0xc5b4ef, _0x18638c) {
        for (
          var _0xf450b4 = _0xea530e["uwCLU"](_0x18638c["length"], 0x1),
            _0x5e93f6 = new Float32Array(_0xea530e["Crtrc"](0x9, _0xf450b4)),
            _0x44db1d = 0x0,
            _0x5ed6e0 = 0x0;
          _0xea530e["tEfaK"](_0x5ed6e0, _0xf450b4);
          _0x5ed6e0++
        )
          (_0x5e93f6[_0x44db1d++] = 0x0),
            (_0x5e93f6[_0x44db1d++] = 0x0),
            (_0x5e93f6[_0x44db1d++] = 0x0),
            (_0x5e93f6[_0x44db1d++] = _0x18638c[_0x5ed6e0]["x"]),
            (_0x5e93f6[_0x44db1d++] = _0x18638c[_0x5ed6e0]["y"]),
            (_0x5e93f6[_0x44db1d++] = _0x18638c[_0x5ed6e0]["z"]),
            (_0x5e93f6[_0x44db1d++] =
              _0x18638c[_0xea530e["QiiKl"](_0x5ed6e0, 0x1)]["x"]),
            (_0x5e93f6[_0x44db1d++] =
              _0x18638c[_0xea530e["QiiKl"](_0x5ed6e0, 0x1)]["y"]),
            (_0x5e93f6[_0x44db1d++] =
              _0x18638c[_0xea530e["UWvbN"](_0x5ed6e0, 0x1)]["z"]);
        var _0x40710e = _0x2b0377["createVertexBuffer"]({
            context: _0xc5b4ef,
            typedArray: _0x5e93f6,
            usage: _0x20568e["STATIC_DRAW"],
          }),
          _0x35dd67 = _0xea530e["Crtrc"](
            0x3,
            Float32Array["BYTES_PER_ELEMENT"]
          ),
          _0x100ad7 = [
            {
              index: _0x57188f["position"],
              vertexBuffer: _0x40710e,
              componentsPerAttribute: 0x3,
              componentDatatype: _0x9079f3["FLOAT"],
              offsetInBytes: 0x0,
              strideInBytes: _0x35dd67,
            },
          ];
        return new _0x3b6de9({
          context: _0xc5b4ef,
          attributes: _0x100ad7,
        });
      }

      function _0x4b06e4(
        _0x169eb9,
        _0x101ab5,
        _0x5673a0,
        _0x494ecd,
        _0xe67ab4,
        _0x3deb34,
        _0x2b55c6,
        _0x20d4a6,
        _0x3ecc29,
        _0x458a17,
        _0x28419d,
        _0x511199
      ) {
        _0xea530e["yJZFf"](_0x458a17, _0x5673a0) &&
          ((_0x5673a0["vertexArray"] = _0x2b55c6),
          (_0x5673a0["renderState"] = _0xe67ab4),
          (_0x5673a0["shaderProgram"] = _0x3deb34),
          (_0x5673a0["uniformMap"] = _0xea530e["qxOGH"](
            _0xd10611,
            _0x20d4a6,
            _0x169eb9["_material"]["_uniforms"]
          )),
          (_0x5673a0["uniformMap"]["u_normalDirection"] = function () {
            return -0x1;
          }),
          (_0x5673a0["pass"] = _0x28419d),
          (_0x5673a0["modelMatrix"] = _0x3ecc29),
          _0x169eb9["_colorCommands"]["push"](_0x5673a0)),
          (_0x101ab5["vertexArray"] = _0x2b55c6),
          (_0x101ab5["renderState"] = _0x494ecd),
          (_0x101ab5["shaderProgram"] = _0x3deb34),
          (_0x101ab5["uniformMap"] = _0xea530e["qxOGH"](
            _0xd10611,
            _0x20d4a6,
            _0x169eb9["_material"]["_uniforms"]
          )),
          _0x511199 &&
            (_0x101ab5["uniformMap"]["u_type"] = function () {
              return 0x1;
            }),
          (_0x101ab5["pass"] = _0x28419d),
          (_0x101ab5["modelMatrix"] = _0x3ecc29),
          _0x169eb9["_colorCommands"]["push"](_0x101ab5);
      }
      _0x7291b5["RectangularSensorPrimitive"] = _0x1c6d03;
    },
    function (_0x280867, _0x1d7cac, _0xf22999) {
      var _0x1fb1da = _0xea530e["UEjUU"]["split"]("|"),
        _0x49a55f = 0x0;
      while (!![]) {
        switch (_0x1fb1da[_0x49a55f++]) {
          case "0":
            var _0x31148e = _0x43785b["DataSourceDisplay"],
              _0x82460c = _0x31148e["defaultVisualizersCallback"];
            continue;
          case "1":
            (_0x43785b["RectangularSensorPrimitive"] =
              _0x2463fd["RectangularSensorPrimitive"]),
              (_0x43785b["RectangularSensorGraphics"] =
                _0x3450f2["RectangularSensorGraphics"]),
              (_0x43785b["RectangularSensorVisualizer"] =
                _0x4081b5["RectangularSensorVisualizer"]);
            continue;
          case "2":
            "use strict";
            continue;
          case "3":
            var _0x2b0929,
              _0x45f91d = _0xea530e["uRvMw"](_0xf22999, 0x0),
              _0x43785b =
                (_0x2b0929 = _0x45f91d) && _0x2b0929["__esModule"]
                  ? _0x2b0929
                  : {
                      default: _0x2b0929,
                    },
              _0x2463fd = _0xea530e["aKyxr"](_0xf22999, 0x1),
              _0x3450f2 = _0xea530e["aKyxr"](_0xf22999, 0x7),
              _0x4081b5 = _0xea530e["aKyxr"](_0xf22999, 0x8);
            continue;
          case "4":
            _0x31148e["defaultVisualizersCallback"] = function (
              _0x4e07b0,
              _0x3da336,
              _0x45390d
            ) {
              var _0x2b0929 = _0x45390d["entities"];
              return _0x4ad2b4["YhxQf"](
                _0x82460c,
                _0x4e07b0,
                _0x3da336,
                _0x45390d
              )["concat"]([
                new _0x4081b5["RectangularSensorVisualizer"](
                  _0x4e07b0,
                  _0x2b0929
                ),
              ]);
            };
            continue;
          case "5":
            var _0x4ad2b4 = {
              YhxQf: function (_0x2973e7, _0x3260e0, _0x9f3b9e, _0x5675cb) {
                return _0xea530e["xUQpS"](
                  _0x2973e7,
                  _0x3260e0,
                  _0x9f3b9e,
                  _0x5675cb
                );
              },
            };
            continue;
        }
        break;
      }
    },
    function (_0x34d696, _0x1e3363) {
      _0x34d696["exports"] = _0xea530e["gUHac"];
    },
    function (_0x20abe8, _0x199945) {
      _0x20abe8["exports"] = _0xea530e["WOGIP"];
    },
    function (_0x327c82, _0x43a6c5) {
      _0x327c82["exports"] = _0xea530e["YTBjN"];
    },
    function (_0x46e86f, _0x508b4d) {
      _0x46e86f["exports"] = _0xea530e["woqkz"];
    },
    function (_0x5e42b2, _0x1ba13e, _0xa72f67) {
      var _0x365225 = {
        uYhYl: function (_0x290d38, _0x3c8214) {
          return _0xea530e["KoeaP"](_0x290d38, _0x3c8214);
        },
        dAQCz: _0xea530e["QPDHW"],
        utWfM: function (_0x3735d1, _0x139c79, _0x232da7) {
          return _0xea530e["elyPZ"](_0x3735d1, _0x139c79, _0x232da7);
        },
        hMlur: function (_0x254e6f, _0x54c082, _0x64ddff) {
          return _0xea530e["elyPZ"](_0x254e6f, _0x54c082, _0x64ddff);
        },
        IhovL: function (_0x119480, _0x45858c, _0x2e8b0e) {
          return _0xea530e["iJzOw"](_0x119480, _0x45858c, _0x2e8b0e);
        },
        fvPWP: function (_0x692d0, _0x57ce4a, _0x506fd9) {
          return _0xea530e["iJzOw"](_0x692d0, _0x57ce4a, _0x506fd9);
        },
        PJakG: function (_0x9767e2, _0x589d84, _0x17a895) {
          return _0xea530e["vwzSd"](_0x9767e2, _0x589d84, _0x17a895);
        },
        BjBdr: function (_0x434e1, _0x7986ea, _0x359e7e) {
          return _0xea530e["FsbZU"](_0x434e1, _0x7986ea, _0x359e7e);
        },
        Bqrxr: function (_0x10d349, _0x24a044, _0x5acb33) {
          return _0xea530e["FsbZU"](_0x10d349, _0x24a044, _0x5acb33);
        },
      };
      ("use strict");
      Object["defineProperty"](_0x1ba13e, _0xea530e["JNTyN"], {
        value: !0x0,
      }),
        (_0x1ba13e["RectangularSensorGraphics"] = void 0x0);
      var _0x375fec,
        _0x5c857f = _0xea530e["dufEy"](_0xa72f67, 0x0),
        _0x5dad58 =
          (_0x375fec = _0x5c857f) && _0x375fec["__esModule"]
            ? _0x375fec
            : {
                default: _0x375fec,
              };
      var _0x31baa9 = _0x5dad58["defaultValue"],
        _0x3e8f3f = _0x5dad58["defined"],
        _0x32e5ae = Object["defineProperties"],
        _0x1b6074 = _0x5dad58["DeveloperError"],
        _0x41dc26 = _0x5dad58["Event"],
        _0x26825a = _0x5dad58["createMaterialPropertyDescriptor"],
        _0x5e4b32 = _0x5dad58["createPropertyDescriptor"];

      function _0x5d5444(_0x223cec) {
        (this["_show"] = void 0x0),
          (this["_radius"] = void 0x0),
          (this["_xHalfAngle"] = void 0x0),
          (this["_yHalfAngle"] = void 0x0),
          (this["_lineColor"] = void 0x0),
          (this["_showSectorLines"] = void 0x0),
          (this["_showSectorSegmentLines"] = void 0x0),
          (this["_showLateralSurfaces"] = void 0x0),
          (this["_material"] = void 0x0),
          (this["_showDomeSurfaces"] = void 0x0),
          (this["_showDomeLines"] = void 0x0),
          (this["_showIntersection"] = void 0x0),
          (this["_intersectionColor"] = void 0x0),
          (this["_intersectionWidth"] = void 0x0),
          (this["_showThroughEllipsoid"] = void 0x0),
          (this["_gaze"] = void 0x0),
          (this["_showScanPlane"] = void 0x0),
          (this["_scanPlaneColor"] = void 0x0),
          (this["_scanPlaneMode"] = void 0x0),
          (this["_scanPlaneRate"] = void 0x0),
          (this["_definitionChanged"] = new _0x41dc26()),
          this["merge"](
            _0xea530e["wVvmT"](_0x31baa9, _0x223cec, _0x31baa9["EMPTY_OBJECT"])
          );
      }
      _0xea530e["FsbZU"](_0x32e5ae, _0x5d5444["prototype"], {
        definitionChanged: {
          get: function () {
            return this["_definitionChanged"];
          },
        },
        show: _0xea530e["dufEy"](_0x5e4b32, _0xea530e["MmUMe"]),
        radius: _0xea530e["iNgiF"](_0x5e4b32, _0xea530e["IiPwE"]),
        xHalfAngle: _0xea530e["qoqCY"](_0x5e4b32, _0xea530e["zAWHb"]),
        yHalfAngle: _0xea530e["qoqCY"](_0x5e4b32, _0xea530e["FGTrU"]),
        lineColor: _0xea530e["qoqCY"](_0x5e4b32, _0xea530e["cFaHf"]),
        showSectorLines: _0xea530e["DjdiR"](_0x5e4b32, _0xea530e["LJMWl"]),
        showSectorSegmentLines: _0xea530e["VAmUJ"](
          _0x5e4b32,
          _0xea530e["XCFwx"]
        ),
        showLateralSurfaces: _0xea530e["VAmUJ"](_0x5e4b32, _0xea530e["FNGKK"]),
        material: _0xea530e["lPWEz"](_0x26825a, _0xea530e["eaEIp"]),
        showDomeSurfaces: _0xea530e["JApNn"](_0x5e4b32, _0xea530e["pyhEv"]),
        showDomeLines: _0xea530e["JApNn"](_0x5e4b32, _0xea530e["aVUpi"]),
        showIntersection: _0xea530e["JApNn"](_0x5e4b32, _0xea530e["AiXjC"]),
        intersectionColor: _0xea530e["STtxn"](_0x5e4b32, _0xea530e["pTqDa"]),
        intersectionWidth: _0xea530e["UOjSG"](_0x5e4b32, _0xea530e["cWnxW"]),
        showThroughEllipsoid: _0xea530e["UOjSG"](_0x5e4b32, _0xea530e["OPnNJ"]),
        gaze: _0xea530e["yoxUX"](_0x5e4b32, _0xea530e["aBUVY"]),
        showScanPlane: _0xea530e["vJtEC"](_0x5e4b32, _0xea530e["PxTAB"]),
        scanPlaneColor: _0xea530e["auHYn"](_0x5e4b32, _0xea530e["PskaR"]),
        scanPlaneMode: _0xea530e["NAkWa"](_0x5e4b32, _0xea530e["ZQKDF"]),
        scanPlaneRate: _0xea530e["AgLdt"](_0x5e4b32, _0xea530e["rZWnc"]),
      }),
        (_0x5d5444["prototype"]["clone"] = function (_0x4acdbc) {
          return (
            _0xea530e["KoeaP"](_0x3e8f3f, _0x4acdbc) ||
              (_0x4acdbc = new _0x5d5444()),
            (_0x4acdbc["show"] = this["show"]),
            (_0x4acdbc["radius"] = this["radius"]),
            (_0x4acdbc["xHalfAngle"] = this["xHalfAngle"]),
            (_0x4acdbc["yHalfAngle"] = this["yHalfAngle"]),
            (_0x4acdbc["lineColor"] = this["lineColor"]),
            (_0x4acdbc["showSectorLines"] = this["showSectorLines"]),
            (_0x4acdbc["showSectorSegmentLines"] =
              this["showSectorSegmentLines"]),
            (_0x4acdbc["showLateralSurfaces"] = this["showLateralSurfaces"]),
            (_0x4acdbc["material"] = this["material"]),
            (_0x4acdbc["showDomeSurfaces"] = this["showDomeSurfaces"]),
            (_0x4acdbc["showDomeLines"] = this["showDomeLines"]),
            (_0x4acdbc["showIntersection"] = this["showIntersection"]),
            (_0x4acdbc["intersectionColor"] = this["intersectionColor"]),
            (_0x4acdbc["intersectionWidth"] = this["intersectionWidth"]),
            (_0x4acdbc["showThroughEllipsoid"] = this["showThroughEllipsoid"]),
            (_0x4acdbc["gaze"] = this["gaze"]),
            (_0x4acdbc["showScanPlane"] = this["showScanPlane"]),
            (_0x4acdbc["scanPlaneColor"] = this["scanPlaneColor"]),
            (_0x4acdbc["scanPlaneMode"] = this["scanPlaneMode"]),
            (_0x4acdbc["scanPlaneRate"] = this["scanPlaneRate"]),
            _0x4acdbc
          );
        }),
        (_0x5d5444["prototype"]["merge"] = function (_0x2f0d80) {
          if (!_0x365225["uYhYl"](_0x3e8f3f, _0x2f0d80))
            throw new _0x1b6074(_0x365225["dAQCz"]);
          (this["show"] = _0x365225["utWfM"](
            _0x31baa9,
            this["show"],
            _0x2f0d80["show"]
          )),
            (this["radius"] = _0x365225["utWfM"](
              _0x31baa9,
              this["radius"],
              _0x2f0d80["radius"]
            )),
            (this["xHalfAngle"] = _0x365225["hMlur"](
              _0x31baa9,
              this["xHalfAngle"],
              _0x2f0d80["xHalfAngle"]
            )),
            (this["yHalfAngle"] = _0x365225["hMlur"](
              _0x31baa9,
              this["yHalfAngle"],
              _0x2f0d80["yHalfAngle"]
            )),
            (this["lineColor"] = _0x365225["IhovL"](
              _0x31baa9,
              this["lineColor"],
              _0x2f0d80["lineColor"]
            )),
            (this["showSectorLines"] = _0x365225["IhovL"](
              _0x31baa9,
              this["showSectorLines"],
              _0x2f0d80["showSectorLines"]
            )),
            (this["showSectorSegmentLines"] = _0x365225["IhovL"](
              _0x31baa9,
              this["showSectorSegmentLines"],
              _0x2f0d80["showSectorSegmentLines"]
            )),
            (this["showLateralSurfaces"] = _0x365225["fvPWP"](
              _0x31baa9,
              this["showLateralSurfaces"],
              _0x2f0d80["showLateralSurfaces"]
            )),
            (this["material"] = _0x365225["PJakG"](
              _0x31baa9,
              this["material"],
              _0x2f0d80["material"]
            )),
            (this["showDomeSurfaces"] = _0x365225["PJakG"](
              _0x31baa9,
              this["showDomeSurfaces"],
              _0x2f0d80["showDomeSurfaces"]
            )),
            (this["showDomeLines"] = _0x365225["PJakG"](
              _0x31baa9,
              this["showDomeLines"],
              _0x2f0d80["showDomeLines"]
            )),
            (this["showIntersection"] = _0x365225["PJakG"](
              _0x31baa9,
              this["showIntersection"],
              _0x2f0d80["showIntersection"]
            )),
            (this["intersectionColor"] = _0x365225["PJakG"](
              _0x31baa9,
              this["intersectionColor"],
              _0x2f0d80["intersectionColor"]
            )),
            (this["intersectionWidth"] = _0x365225["BjBdr"](
              _0x31baa9,
              this["intersectionWidth"],
              _0x2f0d80["intersectionWidth"]
            )),
            (this["showThroughEllipsoid"] = _0x365225["BjBdr"](
              _0x31baa9,
              this["showThroughEllipsoid"],
              _0x2f0d80["showThroughEllipsoid"]
            )),
            (this["gaze"] = _0x365225["BjBdr"](
              _0x31baa9,
              this["gaze"],
              _0x2f0d80["gaze"]
            )),
            (this["showScanPlane"] = _0x365225["BjBdr"](
              _0x31baa9,
              this["showScanPlane"],
              _0x2f0d80["showScanPlane"]
            )),
            (this["scanPlaneColor"] = _0x365225["Bqrxr"](
              _0x31baa9,
              this["scanPlaneColor"],
              _0x2f0d80["scanPlaneColor"]
            )),
            (this["scanPlaneMode"] = _0x365225["Bqrxr"](
              _0x31baa9,
              this["scanPlaneMode"],
              _0x2f0d80["scanPlaneMode"]
            )),
            (this["scanPlaneRate"] = _0x365225["Bqrxr"](
              _0x31baa9,
              this["scanPlaneRate"],
              _0x2f0d80["scanPlaneRate"]
            ));
        }),
        (_0x1ba13e["RectangularSensorGraphics"] = _0x5d5444);
    },
    function (_0x72e74f, _0x1403e6, _0x4526ad) {
      var _0x57eaea = _0xea530e["seISt"]["split"]("|"),
        _0x57e511 = 0x0;
      while (!![]) {
        switch (_0x57eaea[_0x57e511++]) {
          case "0":
            var _0x562f29,
              _0x3fdac3 = _0xea530e["UvVdV"](_0x4526ad, 0x0),
              _0x18dc92 =
                (_0x562f29 = _0x3fdac3) && _0x562f29["__esModule"]
                  ? _0x562f29
                  : {
                      default: _0x562f29,
                    },
              _0x52d2d1 = _0xea530e["UvVdV"](_0x4526ad, 0x1),
              _0xc0a0ed = _0xea530e["tibUF"](_0x4526ad, 0x9);
            continue;
          case "1":
            (_0x1576e3["prototype"]["update"] = function (_0x5a7186) {
              if (!_0xea530e["vXmLv"](_0x5561b1, _0x5a7186))
                throw new _0xb362ea(_0xea530e["pZTcR"]);
              for (
                var _0x1403e6 = this["_entitiesToVisualize"]["values"],
                  _0x4526ad = this["_hash"],
                  _0x562f29 = this["_primitives"],
                  _0x3fdac3 = 0x0,
                  _0x15289c = _0x1403e6["length"];
                _0xea530e["AGnYN"](_0x3fdac3, _0x15289c);
                _0x3fdac3++
              ) {
                var _0x3ec29a,
                  _0x1731de,
                  _0x1cf73b,
                  _0xc0a0ed,
                  _0x582411 = _0x1403e6[_0x3fdac3],
                  _0x90df7f = _0x582411["_rectangularSensor"],
                  _0x509773 = _0x4526ad[_0x582411["id"]],
                  _0x3b7afa =
                    _0x582411["isShowing"] &&
                    _0x582411["isAvailable"](_0x5a7186) &&
                    _0x53f409["getValueOrDefault"](
                      _0x90df7f["_show"],
                      _0x5a7186,
                      !0x0
                    );
                if (
                  (_0x3b7afa &&
                    ((_0x3ec29a = _0x53f409["getValueOrUndefined"](
                      _0x582411["_position"],
                      _0x5a7186,
                      _0x4b4656
                    )),
                    (_0x2f8b2b = _0x53f409["getValueOrUndefined"](
                      _0x582411["_orientation"],
                      _0x5a7186,
                      _0x4e6e44
                    )),
                    (_0x1731de = _0x53f409["getValueOrUndefined"](
                      _0x90df7f["_radius"],
                      _0x5a7186
                    )),
                    (_0x1cf73b = _0x53f409["getValueOrUndefined"](
                      _0x90df7f["_xHalfAngle"],
                      _0x5a7186
                    )),
                    (_0xc0a0ed = _0x53f409["getValueOrUndefined"](
                      _0x90df7f["_yHalfAngle"],
                      _0x5a7186
                    )),
                    (_0x3b7afa =
                      _0xea530e["vXmLv"](_0x5561b1, _0x3ec29a) &&
                      _0xea530e["vXmLv"](_0x5561b1, _0x1cf73b) &&
                      _0xea530e["vXmLv"](_0x5561b1, _0xc0a0ed))),
                  _0x3b7afa)
                ) {
                  var _0x105a91 = _0xea530e["dgCbO"]["split"]("|"),
                    _0x3e463e = 0x0;
                  while (!![]) {
                    switch (_0x105a91[_0x3e463e++]) {
                      case "0":
                        _0xea530e["vXmLv"](_0x5561b1, _0x3ded44) ||
                          (((_0x3ded44 = new _0x52d2d1[
                            "RectangularSensorPrimitive"
                          ]())["id"] = _0x582411),
                          _0x562f29["add"](_0x3ded44),
                          (_0x509773 = {
                            primitive: _0x3ded44,
                            position: void 0x0,
                            orientation: void 0x0,
                          }),
                          (_0x4526ad[_0x582411["id"]] = _0x509773));
                        continue;
                      case "1":
                        var _0x3ded44 = _0xea530e["JrZsV"](_0x5561b1, _0x509773)
                          ? _0x509773["primitive"]
                          : void 0x0;
                        continue;
                      case "2":
                        (_0x3ded44["show"] = !0x0),
                          (_0x3ded44["gaze"] = _0x2d28ab),
                          (_0x3ded44["radius"] = _0x1731de),
                          (_0x3ded44["xHalfAngle"] = _0x1cf73b),
                          (_0x3ded44["yHalfAngle"] = _0xc0a0ed),
                          (_0x3ded44["lineColor"] = _0x53f409[
                            "getValueOrDefault"
                          ](
                            _0x90df7f["_lineColor"],
                            _0x5a7186,
                            _0x5cdcec["WHITE"]
                          )),
                          (_0x3ded44["showSectorLines"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_showSectorLines"], _0x5a7186, !0x0)),
                          (_0x3ded44["showSectorSegmentLines"] = _0x53f409[
                            "getValueOrDefault"
                          ](
                            _0x90df7f["_showSectorSegmentLines"],
                            _0x5a7186,
                            !0x0
                          )),
                          (_0x3ded44["showLateralSurfaces"] = _0x53f409[
                            "getValueOrDefault"
                          ](
                            _0x90df7f["_showLateralSurfaces"],
                            _0x5a7186,
                            !0x0
                          )),
                          (_0x3ded44["material"] = _0x514bb3["getValue"](
                            _0x5a7186,
                            _0x90df7f["_material"],
                            _0x3ded44["material"]
                          )),
                          (_0x3ded44["showDomeSurfaces"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_showDomeSurfaces"], _0x5a7186, !0x0)),
                          (_0x3ded44["showDomeLines"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_showDomeLines"], _0x5a7186, !0x0)),
                          (_0x3ded44["showIntersection"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_showIntersection"], _0x5a7186, !0x0)),
                          (_0x3ded44["intersectionColor"] = _0x53f409[
                            "getValueOrDefault"
                          ](
                            _0x90df7f["_intersectionColor"],
                            _0x5a7186,
                            _0x5cdcec["WHITE"]
                          )),
                          (_0x3ded44["intersectionWidth"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_intersectionWidth"], _0x5a7186, 0x1)),
                          (_0x3ded44["showThroughEllipsoid"] = _0x53f409[
                            "getValueOrDefault"
                          ](
                            _0x90df7f["_showThroughEllipsoid"],
                            _0x5a7186,
                            !0x0
                          )),
                          (_0x3ded44["scanPlaneMode"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_scanPlaneMode"], _0x5a7186)),
                          (_0x3ded44["scanPlaneColor"] = _0x53f409[
                            "getValueOrDefault"
                          ](
                            _0x90df7f["_scanPlaneColor"],
                            _0x5a7186,
                            _0x5cdcec["WHITE"]
                          )),
                          (_0x3ded44["showScanPlane"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_showScanPlane"], _0x5a7186, !0x0)),
                          (_0x3ded44["scanPlaneRate"] = _0x53f409[
                            "getValueOrDefault"
                          ](_0x90df7f["_scanPlaneRate"], _0x5a7186, 0x1));
                        continue;
                      case "3":
                        if (_0xea530e["DhCFm"](_0x5561b1, _0x2d28ab)) {
                          var _0x19f8ce = _0x53f409["getValueOrUndefined"](
                            _0x2d28ab["_position"],
                            _0x5a7186,
                            _0x43d092
                          );
                          if (
                            !_0xea530e["dgcuw"](_0x5561b1, _0x3ec29a) ||
                            !_0xea530e["dgcuw"](_0x5561b1, _0x19f8ce)
                          )
                            continue;
                          var _0x495d85 = _0x505aa5["subtract"](
                              _0x3ec29a,
                              _0x19f8ce,
                              _0x1a05ae
                            ),
                            _0x7f8c8a = _0x505aa5["angleBetween"](
                              _0x18dc92["Cartesian3"]["UNIT_Z"],
                              _0x495d85
                            ),
                            _0x16f83a = _0x505aa5["cross"](
                              _0x18dc92["Cartesian3"]["UNIT_Z"],
                              _0x495d85,
                              _0x1a05ae
                            ),
                            _0x2f8b2b = _0x3ebdbe["fromAxisAngle"](
                              _0x16f83a,
                              _0xea530e["xaliA"](_0x7f8c8a, Math["PI"]),
                              _0x4093b3
                            );
                          (_0x1731de = _0x505aa5["distance"](
                            _0x3ec29a,
                            _0x19f8ce
                          )),
                            (_0x3ded44["modelMatrix"] = _0x93a907[
                              "fromRotationTranslation"
                            ](
                              _0x3c4488["fromQuaternion"](_0x2f8b2b, _0x347c92),
                              _0x3ec29a,
                              _0x3ded44["modelMatrix"]
                            ));
                        } else
                          (_0x505aa5["equals"](
                            _0x3ec29a,
                            _0x509773["position"]
                          ) &&
                            _0x3ebdbe["equals"](
                              _0x2f8b2b,
                              _0x509773["orientation"]
                            )) ||
                            (_0xea530e["dgcuw"](_0x5561b1, _0x2f8b2b)
                              ? ((_0x3ded44["modelMatrix"] = _0x93a907[
                                  "fromRotationTranslation"
                                ](
                                  _0x3c4488["fromQuaternion"](
                                    _0x2f8b2b,
                                    _0x347c92
                                  ),
                                  _0x3ec29a,
                                  _0x3ded44["modelMatrix"]
                                )),
                                (_0x509773["position"] = _0x505aa5["clone"](
                                  _0x3ec29a,
                                  _0x509773["position"]
                                )),
                                (_0x509773["orientation"] = _0x3ebdbe["clone"](
                                  _0x2f8b2b,
                                  _0x509773["orientation"]
                                )))
                              : ((_0x3ded44["modelMatrix"] =
                                  _0x18dc92["Transforms"][
                                    "eastNorthUpToFixedFrame"
                                  ](_0x3ec29a)),
                                (_0x509773["position"] = _0x505aa5["clone"](
                                  _0x3ec29a,
                                  _0x509773["position"]
                                ))));
                        continue;
                      case "4":
                        var _0x2d28ab = _0x53f409["getValueOrUndefined"](
                          _0x90df7f["_gaze"],
                          _0x5a7186
                        );
                        continue;
                    }
                    break;
                  }
                } else
                  _0xea530e["dgcuw"](_0x5561b1, _0x509773) &&
                    (_0x509773["primitive"]["show"] = !0x1);
              }
              return !0x0;
            }),
              (_0x1576e3["prototype"]["isDestroyed"] = function () {
                return !0x1;
              }),
              (_0x1576e3["prototype"]["destroy"] = function () {
                for (
                  var _0x72e74f = this["_entitiesToVisualize"]["values"],
                    _0x1403e6 = this["_hash"],
                    _0x4526ad = this["_primitives"],
                    _0x562f29 = _0xea530e["Ydstt"](_0x72e74f["length"], 0x1);
                  _0xea530e["AWaOk"](-0x1, _0x562f29);
                  _0x562f29--
                )
                  (0x0, _0xc0a0ed["removePrimitive"])(
                    _0x72e74f[_0x562f29],
                    _0x1403e6,
                    _0x4526ad
                  );
                return _0xea530e["nQPCE"](_0x436810, this);
              }),
              (_0x1576e3["prototype"]["_onCollectionChanged"] = function (
                _0x2e871b,
                _0x248451,
                _0x166056,
                _0x3fc30c
              ) {
                var _0x3fdac3,
                  _0x45330f,
                  _0x962508 = this["_entitiesToVisualize"],
                  _0x43c561 = this["_hash"],
                  _0x1afde1 = this["_primitives"];
                for (
                  _0x3fdac3 = _0x245869["opexE"](_0x248451["length"], 0x1);
                  _0x245869["tuMDv"](-0x1, _0x3fdac3);
                  _0x3fdac3--
                )
                  (_0x45330f = _0x248451[_0x3fdac3]),
                    _0x245869["kOrQm"](
                      _0x5561b1,
                      _0x45330f["_rectangularSensor"]
                    ) &&
                      _0x245869["kOrQm"](_0x5561b1, _0x45330f["_position"]) &&
                      _0x962508["set"](_0x45330f["id"], _0x45330f);
                for (
                  _0x3fdac3 = _0x245869["kofHt"](_0x3fc30c["length"], 0x1);
                  _0x245869["AzBrs"](-0x1, _0x3fdac3);
                  _0x3fdac3--
                )
                  (_0x45330f = _0x3fc30c[_0x3fdac3]),
                    _0x245869["kOrQm"](
                      _0x5561b1,
                      _0x45330f["_rectangularSensor"]
                    ) && _0x245869["aDHCx"](_0x5561b1, _0x45330f["_position"])
                      ? _0x962508["set"](_0x45330f["id"], _0x45330f)
                      : ((0x0, _0xc0a0ed["removePrimitive"])(
                          _0x45330f,
                          _0x43c561,
                          _0x1afde1
                        ),
                        _0x962508["remove"](_0x45330f["id"]));
                for (
                  _0x3fdac3 = _0x245869["TyANn"](_0x166056["length"], 0x1);
                  _0x245869["AzBrs"](-0x1, _0x3fdac3);
                  _0x3fdac3--
                )
                  (_0x45330f = _0x166056[_0x3fdac3]),
                    (0x0, _0xc0a0ed["removePrimitive"])(
                      _0x45330f,
                      _0x43c561,
                      _0x1afde1
                    ),
                    _0x962508["remove"](_0x45330f["id"]);
              }),
              (_0x1403e6["RectangularSensorVisualizer"] = _0x1576e3);
            continue;
          case "2":
            Object["defineProperty"](_0x1403e6, _0xea530e["JNTyN"], {
              value: !0x0,
            }),
              (_0x1403e6["RectangularSensorVisualizer"] = void 0x0);
            continue;
          case "3":
            var _0x245869 = {
              opexE: function (_0x4168b1, _0x36e478) {
                return _0xea530e["aNmFW"](_0x4168b1, _0x36e478);
              },
              tuMDv: function (_0x3acb9b, _0x4ee9dc) {
                return _0xea530e["AWaOk"](_0x3acb9b, _0x4ee9dc);
              },
              kOrQm: function (_0xce6dea, _0x4b3392) {
                return _0xea530e["zugUo"](_0xce6dea, _0x4b3392);
              },
              kofHt: function (_0x3c39b6, _0x322f28) {
                return _0xea530e["aNmFW"](_0x3c39b6, _0x322f28);
              },
              AzBrs: function (_0x341c75, _0xde6d23) {
                return _0xea530e["TiQxB"](_0x341c75, _0xde6d23);
              },
              aDHCx: function (_0x19ec73, _0x183188) {
                return _0xea530e["yatBa"](_0x19ec73, _0x183188);
              },
              TyANn: function (_0x2e79da, _0x3bb339) {
                return _0xea530e["aNmFW"](_0x2e79da, _0x3bb339);
              },
            };
            continue;
          case "4":
            "use strict";
            continue;
          case "5":
            var _0x6865ff = _0x18dc92["AssociativeArray"],
              _0x505aa5 = _0x18dc92["Cartesian3"],
              _0x5cdcec = _0x18dc92["Color"],
              _0x5561b1 = _0x18dc92["defined"],
              _0x436810 = _0x18dc92["destroyObject"],
              _0xb362ea = _0x18dc92["DeveloperError"],
              _0x3c4488 = _0x18dc92["Matrix3"],
              _0x93a907 = _0x18dc92["Matrix4"],
              _0x3ebdbe = _0x18dc92["Quaternion"],
              _0x514bb3 = _0x18dc92["MaterialProperty"],
              _0x53f409 = _0x18dc92["Property"],
              _0x347c92 = new _0x3c4488(),
              _0x4b4656 = (new _0x93a907(), new _0x505aa5()),
              _0x43d092 = new _0x505aa5(),
              _0x4e6e44 = new _0x3ebdbe(),
              _0x1a05ae = new _0x505aa5(),
              _0x4093b3 = new _0x3ebdbe(),
              _0x1576e3 = function _0x72e74f(_0x3bd4d5, _0x578b01) {
                if (!_0xea530e["vXmLv"](_0x5561b1, _0x3bd4d5))
                  throw new _0xb362ea(_0xea530e["GrNht"]);
                if (!_0xea530e["vXmLv"](_0x5561b1, _0x578b01))
                  throw new _0xb362ea(_0xea530e["Zvmdh"]);
                _0x578b01["collectionChanged"]["addEventListener"](
                  _0x72e74f["prototype"]["_onCollectionChanged"],
                  this
                ),
                  (this["_scene"] = _0x3bd4d5),
                  (this["_primitives"] = _0x3bd4d5["primitives"]),
                  (this["_entityCollection"] = _0x578b01),
                  (this["_hash"] = {}),
                  (this["_entitiesToVisualize"] = new _0x6865ff()),
                  this["_onCollectionChanged"](
                    _0x578b01,
                    _0x578b01["values"],
                    [],
                    []
                  );
              };
            continue;
        }
        break;
      }
    },
    function (_0x1adbd4, _0x474fb5, _0x541e48) {
      "use strict";
      Object["defineProperty"](_0x474fb5, _0xea530e["JNTyN"], {
        value: !0x0,
      }),
        (_0x474fb5["removePrimitive"] = function (
          _0x5cbb74,
          _0x660567,
          _0x23580e
        ) {
          var _0x2c9d4b = _0x660567[_0x5cbb74["id"]];
          if (_0xea530e["kGgTI"](_0x4d80b9, _0x2c9d4b)) {
            var _0x5e01f6 = _0x2c9d4b["primitive"];
            try {
              _0x23580e["remove"](_0x5e01f6);
            } catch (_0x2e1a6e) {}
            _0x5e01f6["isDestroyed"] &&
              !_0x5e01f6["isDestroyed"]() &&
              _0x5e01f6["destroy"](),
              delete _0x660567[_0x5cbb74["id"]];
          }
        });
      var _0x3113a4,
        _0x1c863e = _0xea530e["kGgTI"](_0x541e48, 0x0);
      var _0x4d80b9 = (
        (_0x3113a4 = _0x1c863e) && _0x3113a4["__esModule"]
          ? _0x3113a4
          : {
              default: _0x3113a4,
            }
      )["defined"];
    },
  ]);
});
(function () {
  var _0x1b1620 = {
    OvXet: function (_0x1391cc, _0x5ba065) {
      return _0x1391cc == _0x5ba065;
    },
    yUIlO: function (_0x381f64, _0xf0db9) {
      return _0x381f64 == _0xf0db9;
    },
    SNXRP: function (_0x1a0982, _0x398ab9, _0x1ddd16) {
      return _0x1a0982(_0x398ab9, _0x1ddd16);
    },
    MbLdv: function (_0x218e0c, _0x182f77) {
      return _0x218e0c >= _0x182f77;
    },
    kaULM: function (_0x309178, _0x5ea194) {
      return _0x309178 === _0x5ea194;
    },
  };

  function _0x212a96(_0x3b7d3e, _0x48a873) {
    if (Cesium["defined"](_0x3b7d3e["id"])) {
      var _0x4ab546 = _0x3b7d3e["id"];
      if (_0x4ab546["_noMousePosition"]) return !0x1;
      if (_0x48a873 && _0x1b1620["OvXet"](_0x4ab546, _0x48a873)) return !0x1;
    }
    if (Cesium["defined"](_0x3b7d3e["primitive"])) {
      var _0x5d0f3a = _0x3b7d3e["primitive"];
      if (_0x5d0f3a["_noMousePosition"]) return !0x1;
      if (_0x48a873 && _0x1b1620["yUIlO"](_0x5d0f3a, _0x48a873)) return !0x1;
    }
    return !0x0;
  }

  function _0x323b10(_0x5d21e2, _0x1c88a8, _0xe8b9d8) {
    var _0x51e6c3,
      _0x1f16ed = _0x5d21e2["pick"](_0x1c88a8);
    if (
      _0x5d21e2["pickPositionSupported"] &&
      Cesium["defined"](_0x1f16ed) &&
      _0x1b1620["SNXRP"](_0x212a96, _0x1f16ed, _0xe8b9d8)
    ) {
      var _0x51e6c3 = _0x5d21e2["pickPosition"](_0x1c88a8);
      if (Cesium["defined"](_0x51e6c3)) {
        var _0x2fb017 = Cesium["Cartographic"]["fromCartesian"](_0x51e6c3),
          _0x83f6ea = _0x2fb017["height"];

        if (_0x1b1620["MbLdv"](_0x83f6ea, 0x0)) return _0x51e6c3;
        if (
          !Cesium["defined"](_0x1f16ed["id"]) &&
          _0x1b1620["MbLdv"](_0x83f6ea, -0x1f4)
        )
          return _0x51e6c3;
      }
    }
    if (_0x1b1620["kaULM"](_0x5d21e2["mode"], Cesium["SceneMode"]["SCENE3D"])) {
      var _0x3f52ca = _0x5d21e2["camera"]["getPickRay"](_0x1c88a8);
      _0x51e6c3 = _0x5d21e2["globe"]["pick"](_0x3f52ca, _0x5d21e2);
    } else
      _0x51e6c3 = _0x5d21e2["camera"]["pickEllipsoid"](
        _0x1c88a8,
        _0x5d21e2["globe"]["ellipsoid"]
      );
    return _0x51e6c3;
  }
  Cesium["getCurrentMousePosition"] = _0x323b10;
})();
(function () {
  var _0x10b9e7 = {
    ovAiI: function (_0x12a995, _0x1b156f) {
      return _0x12a995 instanceof _0x1b156f;
    },
    ltLdW: "Cannot\x20call\x20a\x20class\x20as\x20a\x20function",
    vvsKd: function (_0x252d59, _0x33c07d) {
      return _0x252d59 < _0x33c07d;
    },
    mHiwZ: function (_0x712313, _0x3fc04b) {
      return _0x712313 in _0x3fc04b;
    },
    gxdQG: "value",
    nyalp: function (_0x21c8eb, _0x39f745, _0x173915) {
      return _0x21c8eb(_0x39f745, _0x173915);
    },
    KFYxH: function (_0x922283, _0x5832e0) {
      return _0x922283 != _0x5832e0;
    },
    dteXP: "4|2|3|0|1",
    Qemtg: function (_0x985076, _0x55789a) {
      return _0x985076 / _0x55789a;
    },
    dUTDf: function (_0x4017c1, _0x26d231) {
      return _0x4017c1(_0x26d231);
    },
    jrmUL: function (_0x47410c, _0x3685e1) {
      return _0x47410c / _0x3685e1;
    },
    DchsN: function (_0x5adf77, _0x4f79a7) {
      return _0x5adf77 / _0x4f79a7;
    },
    WJsto: "vertical",
    FtATT: "2|4|0|3|1|5",
    nfReG: function (_0x261749, _0x5885ce, _0x55cd41) {
      return _0x261749(_0x5885ce, _0x55cd41);
    },
    AQvGD: "_leftClick",
    BQvGD: "_mouseMove",
    wQvGD: "_bindMourseEvent",
    jQmEv: "_unbindMourseEvent",
    mZfvJ: "_addToScene",
    qRPvH: "_createShadowMap",
    OLrSo: "getFrustumQuaternion",
    nINgp: "_addPostProcess",
    rLnie: "removeRadar",
    SsJId: "resetRadar",
    jhBcL: "addRadar",
    zrSYp: "update",
    mjHWw: "destroy",
    RhQMM: "horizontalAngle",
    YuPND: "verticalAngle",
    esFlX: "distance",
    mtkMO: "visibleAreaColor",
    NRhII: "hiddenAreaColor",
    CawbY: "alpha",
    ubOlw: "__esModule",
  };
  ("use strict");

  function _0x535700(_0x4ef0cc) {
    return _0x4ef0cc && _0x4ef0cc["__esModule"]
      ? _0x4ef0cc
      : {
          default: _0x4ef0cc,
        };
  }

  function _0x4b472b(_0x541612, _0x1a680d) {
    if (!_0x10b9e7["ovAiI"](_0x541612, _0x1a680d))
      throw new TypeError(_0x10b9e7["ltLdW"]);
  }
  Object["defineProperty"](Cesium, _0x10b9e7["ubOlw"], {
    value: !0x0,
  }),
    (Cesium["ViewShed3D"] = void 0x0);
  var _0x2de5fe = (function () {
      var _0x36827f = {
        ulxaP: function (_0x349443, _0x50f500, _0x58d781) {
          return _0x10b9e7["nyalp"](_0x349443, _0x50f500, _0x58d781);
        },
      };

      function _0x3ea4f8(_0x3959a7, _0x45429e) {
        for (
          var _0x29ed09 = 0x0;
          _0x10b9e7["vvsKd"](_0x29ed09, _0x45429e["length"]);
          _0x29ed09++
        ) {
          var _0x535700 = _0x45429e[_0x29ed09];
          (_0x535700["enumerable"] = _0x535700["enumerable"] || !0x1),
            (_0x535700["configurable"] = !0x0),
            _0x10b9e7["mHiwZ"](_0x10b9e7["gxdQG"], _0x535700) &&
              (_0x535700["writable"] = !0x0),
            Object["defineProperty"](_0x3959a7, _0x535700["key"], _0x535700);
        }
      }
      return function (_0x457efc, _0x2b0064, _0x55e0ed) {
        return (
          _0x2b0064 &&
            _0x36827f["ulxaP"](_0x3ea4f8, _0x457efc["prototype"], _0x2b0064),
          _0x55e0ed && _0x36827f["ulxaP"](_0x3ea4f8, _0x457efc, _0x55e0ed),
          _0x457efc
        );
      };
    })(),
    _0x23958f = {
      cameraPosition: null,
      viewPosition: null,
      horizontalAngle: 0x78,
      verticalAngle: 0x5a,
      visibleAreaColor: new Cesium["Color"](0x0, 0x1, 0x0),
      hiddenAreaColor: new Cesium["Color"](0x1, 0x0, 0x0),
      alpha: 0.5,
      distance: 0x64,
      frustum: !0x0,
    };
  Cesium["ViewShed3D"] = (function () {
    var _0x26e288 = {
      pMjPx: function (_0x4d8d11, _0x2b2426) {
        return _0x10b9e7["dUTDf"](_0x4d8d11, _0x2b2426);
      },
      jeBFz: _0x10b9e7["FtATT"],
    };

    function _0x4602f6(_0xe3cb72, _0x2bdd01) {
      _0x10b9e7["nyalp"](_0x4b472b, this, _0x4602f6),
        _0xe3cb72 &&
          (_0x2bdd01 || (_0x2bdd01 = {}),
          (this["viewer"] = _0xe3cb72),
          (this["cameraPosition"] = Cesium["defaultValue"](
            _0x2bdd01["cameraPosition"],
            _0x23958f["cameraPosition"]
          )),
          (this["viewPosition"] = Cesium["defaultValue"](
            _0x2bdd01["viewPosition"],
            _0x23958f["viewPosition"]
          )),
          (this["_horizontalAngle"] = Cesium["defaultValue"](
            _0x2bdd01["horizontalAngle"],
            _0x23958f["horizontalAngle"]
          )),
          (this["_verticalAngle"] = Cesium["defaultValue"](
            _0x2bdd01["verticalAngle"],
            _0x23958f["verticalAngle"]
          )),
          (this["_visibleAreaColor"] = Cesium["defaultValue"](
            _0x2bdd01["visibleAreaColor"],
            _0x23958f["visibleAreaColor"]
          )),
          (this["_hiddenAreaColor"] = Cesium["defaultValue"](
            _0x2bdd01["hiddenAreaColor"],
            _0x23958f["hiddenAreaColor"]
          )),
          (this["_alpha"] = Cesium["defaultValue"](
            _0x2bdd01["alpha"],
            _0x23958f["alpha"]
          )),
          (this["_distance"] = Cesium["defaultValue"](
            _0x2bdd01["distance"],
            _0x23958f["distance"]
          )),
          (this["_frustum"] = Cesium["defaultValue"](
            _0x2bdd01["frustum"],
            _0x23958f["frustum"]
          )),
          (this["calback"] = _0x2bdd01["calback"]),
          this["cameraPosition"] && this["viewPosition"]
            ? "" /* (this["_addToScene"](), this["calback"] && this["calback"]()) */
            : "") /* this["_bindMourseEvent"]() */;
    }
    return (
      _0x10b9e7["nfReG"](_0x2de5fe, _0x4602f6, [
        {
          key: _0x10b9e7["AQvGD"],
          value: function () {
            var _0x4602f6 = this,
              _0x219cf7 = this["viewer"];
            return function (_0x1b3e30) {
              var _0x535700 = Cesium["getCurrentMousePosition"](
                _0x219cf7["scene"],
                _0x1b3e30["position"]
              );
              var cartPoint =
                Cesium["Cartographic"]["fromCartesian"](_0x535700);
              cartPoint.height += 0.5;
              var _0x535700 = Cesium["Cartographic"]["toCartesian"](cartPoint);
              _0x535700 &&
                (_0x4602f6["cameraPosition"]
                  ? _0x4602f6["cameraPosition"] &&
                    !_0x4602f6["viewPosition"] &&
                    ((_0x4602f6["viewPosition"] = _0x535700),
                    _0x4602f6["_addToScene"](),
                    _0x4602f6["_unbindMourseEvent"](),
                    _0x4602f6["calback"] && _0x4602f6["calback"]())
                  : (_0x4602f6["cameraPosition"] = _0x535700));
            };
          },
        },
        {
          key: _0x10b9e7["BQvGD"],
          value: function () {
            var _0x4602f6 = this,
              _0x219cf7 = this["viewer"];
            return function (_0x1cd9d1) {
              var _0x535700 = Cesium["getCurrentMousePosition"](
                _0x219cf7["scene"],
                _0x1cd9d1["endPosition"]
              );
              if (_0x535700) {
                var _0x4b472b = _0x4602f6["cameraPosition"];
                _0x4b472b &&
                  ((_0x4602f6["frustumQuaternion"] = _0x4602f6[
                    "getFrustumQuaternion"
                  ](_0x4b472b, _0x535700)),
                  (_0x4602f6["distance"] = _0x26e288["pMjPx"](
                    Number,
                    Cesium["Cartesian3"]
                      ["distance"](_0x4b472b, _0x535700)
                      ["toFixed"](0x1)
                  )));
              }
            };
          },
        },
        {
          key: _0x10b9e7["wQvGD"],
          value: function () {
            var _0x4602f6 = this,
              _0x219cf7 = this["viewer"],
              _0x5944f7 = new Cesium["ScreenSpaceEventHandler"](
                this["viewer"]["scene"]["canvas"]
              );
            _0x5944f7["setInputAction"](function (_0x1b3e30) {
              var _0x535700 = Cesium["getCurrentMousePosition"](
                _0x219cf7["scene"],
                _0x1b3e30["position"]
              );
              var cartPoint =
                Cesium["Cartographic"]["fromCartesian"](_0x535700);
              cartPoint.height += 0.5;
              var _0x535700 = Cesium["Cartographic"]["toCartesian"](cartPoint);
              _0x535700 &&
                (_0x4602f6["cameraPosition"]
                  ? _0x4602f6["cameraPosition"] &&
                    !_0x4602f6["viewPosition"] &&
                    ((_0x4602f6["viewPosition"] = _0x535700),
                    _0x4602f6["_addToScene"](),
                    _0x4602f6["_unbindMourseEvent"](),
                    _0x4602f6["calback"] && _0x4602f6["calback"]())
                  : (_0x4602f6["cameraPosition"] = _0x535700));
            }, Cesium["ScreenSpaceEventType"]["LEFT_CLICK"]),
              _0x5944f7["setInputAction"](function (_0x1cd9d1) {
                var _0x535700 = Cesium["getCurrentMousePosition"](
                  _0x219cf7["scene"],
                  _0x1cd9d1["endPosition"]
                );
                if (_0x535700) {
                  var _0x4b472b = _0x4602f6["cameraPosition"];
                  _0x4b472b &&
                    ((_0x4602f6["frustumQuaternion"] = _0x4602f6[
                      "getFrustumQuaternion"
                    ](_0x4b472b, _0x535700)),
                    (_0x4602f6["distance"] = _0x26e288["pMjPx"](
                      Number,
                      Cesium["Cartesian3"]
                        ["distance"](_0x4b472b, _0x535700)
                        ["toFixed"](0x1)
                    )));
                }
              }, Cesium["ScreenSpaceEventType"]["MOUSE_MOVE"]),
              (this["_handler"] = _0x5944f7);
          },
        },
        {
          key: _0x10b9e7["jQmEv"],
          value: function () {
            _0x10b9e7["KFYxH"](null, this["_handler"]) &&
              (this["_handler"]["destroy"](), delete this["_handler"]);
          },
        },
        {
          key: _0x10b9e7["mZfvJ"],
          value: function () {
            (this["frustumQuaternion"] = this["getFrustumQuaternion"](
              this["cameraPosition"],
              this["viewPosition"]
            )),
              this["_createShadowMap"](
                this["cameraPosition"],
                this["viewPosition"]
              ),
              this["_addPostProcess"](),
              !this["radar"] &&
                this["addRadar"](
                  this["cameraPosition"],
                  this["frustumQuaternion"]
                ),
              this["viewer"]["scene"]["primitives"]["add"](this);
          },
        },
        {
          key: _0x10b9e7["qRPvH"],
          value: function (_0x2fdf7f, _0x4a93ef, _0x3b7e93) {
            var _0x436d7b = _0x10b9e7["dteXP"]["split"]("|"),
              _0x387e1e = 0x0;
            while (!![]) {
              switch (_0x436d7b[_0x387e1e++]) {
                case "0":
                  (this["distance"] = _0x4a4e7e),
                    (_0x4eb33f["frustum"] = new Cesium["PerspectiveFrustum"]({
                      fov: Cesium["Math"]["toRadians"](0x78),
                      aspectRatio: _0x10b9e7["Qemtg"](
                        _0x2de5fe["canvas"]["clientWidth"],
                        _0x2de5fe["canvas"]["clientHeight"]
                      ),
                      near: 0.1,
                      far: 0x1388,
                    }));
                  continue;
                case "1":
                  (this["viewShadowMap"] = new Cesium["ShadowMap"]({
                    lightCamera: _0x4eb33f,
                    enable: !0x1,
                    isPointLight: !0x1,
                    isSpotLight: !0x0,
                    cascadesEnabled: !0x1,
                    context: _0x2de5fe["context"],
                    pointLightRadius: _0x4a4e7e,
                  })),
                    (this["viewShadowMap"].fromLightSource = false),
                    (this["viewShadowMap"].cascadesEnabled = false),
                    (this["viewShadowMap"].softShadows = false),
                    (this["viewShadowMap"].normalOffset = false),
                    (this["viewShadowMap"]._terrainBias.depthBias = 0.0);
                  continue;
                case "2":
                  (_0x4eb33f["position"] = _0x535700),
                    (_0x4eb33f["direction"] = Cesium["Cartesian3"]["subtract"](
                      _0x4b472b,
                      _0x535700,
                      new Cesium["Cartesian3"](0x0, 0x0, 0x0)
                    )),
                    (_0x4eb33f["up"] = Cesium["Cartesian3"]["normalize"](
                      _0x535700,
                      new Cesium["Cartesian3"](0x0, 0x0, 0x0)
                    ));
                  continue;
                case "3":
                  var _0x4a4e7e = _0x10b9e7["dUTDf"](
                    Number,
                    Cesium["Cartesian3"]
                      ["distance"](_0x4b472b, _0x535700)
                      ["toFixed"](0x1)
                  );
                  continue;
                case "4":
                  var _0x535700 = _0x2fdf7f,
                    _0x4b472b = _0x4a93ef,
                    _0x2de5fe = this["viewer"]["scene"],
                    _0x4eb33f = new Cesium["Camera"](_0x2de5fe);
                  continue;
              }
              break;
            }
          },
        },
        {
          key: _0x10b9e7["OLrSo"],
          value: function (_0x15776c, _0xb6af03) {
            var _0x1d7cd5 = _0x26e288["jeBFz"]["split"]("|"),
              _0x1fb969 = 0x0;
            while (!![]) {
              switch (_0x1d7cd5[_0x1fb969++]) {
                case "0":
                  var _0x2de5fe = _0x4b472b["rightWC"],
                    _0x4b29c7 = new Cesium["Cartesian3"](),
                    _0xb90e44 = new Cesium["Matrix3"](),
                    _0x432a29 = new Cesium["Quaternion"]();
                  continue;
                case "1":
                  var _0x359de6 = _0xb90e44;
                  continue;
                case "2":
                  var _0x13b3d0 = Cesium["Cartesian3"]["normalize"](
                      Cesium["Cartesian3"]["subtract"](
                        _0xb6af03,
                        _0x15776c,
                        new Cesium["Cartesian3"]()
                      ),
                      new Cesium["Cartesian3"]()
                    ),
                    _0x535700 = Cesium["Cartesian3"]["normalize"](
                      _0x15776c,
                      new Cesium["Cartesian3"]()
                    ),
                    _0x4b472b = new Cesium["Camera"](this["viewer"]["scene"]);
                  continue;
                case "3":
                  _0x2de5fe = Cesium["Cartesian3"]["negate"](
                    _0x2de5fe,
                    _0x4b29c7
                  );
                  continue;
                case "4":
                  (_0x4b472b["position"] = _0x15776c),
                    (_0x4b472b["direction"] = _0x13b3d0),
                    (_0x4b472b["up"] = _0x535700),
                    (_0x13b3d0 = _0x4b472b["directionWC"]),
                    (_0x535700 = _0x4b472b["upWC"]);
                  continue;
                case "5":
                  return (
                    Cesium["Matrix3"]["setColumn"](
                      _0x359de6,
                      0x0,
                      _0x2de5fe,
                      _0x359de6
                    ),
                    Cesium["Matrix3"]["setColumn"](
                      _0x359de6,
                      0x1,
                      _0x535700,
                      _0x359de6
                    ),
                    Cesium["Matrix3"]["setColumn"](
                      _0x359de6,
                      0x2,
                      _0x13b3d0,
                      _0x359de6
                    ),
                    Cesium["Quaternion"]["fromRotationMatrix"](
                      _0x359de6,
                      _0x432a29
                    )
                  );
              }
              break;
            }
          },
        },
        {
          key: _0x10b9e7["nINgp"],
          value: function () {
            var _0x5a0ceb = {
              dbcSd: function (_0x516103, _0x139d6b) {
                return _0x10b9e7["jrmUL"](_0x516103, _0x139d6b);
              },
              gizUv: function (_0x14c5c3, _0x4f37dd) {
                return _0x10b9e7["jrmUL"](_0x14c5c3, _0x4f37dd);
              },
            };
            var _0x4602f6 = this,
              _0x31dbc7 = this,
              _0x535700 = _0x31dbc7["viewShadowMap"]["_isPointLight"]
                ? _0x31dbc7["viewShadowMap"]["_pointBias"]
                : _0x31dbc7["viewShadowMap"]["_primitiveBias"];
            this["postProcess"] = this["viewer"]["scene"]["postProcessStages"][
              "add"
            ](
              new Cesium["PostProcessStage"]({
                fragmentShader: ViewShead3D_FS,
                uniforms: {
                  czzj: function () {
                    return _0x4602f6["verticalAngle"];
                  },
                  dis: function () {
                    return _0x4602f6["distance"];
                  },
                  spzj: function () {
                    return _0x4602f6["horizontalAngle"];
                  },
                  visibleColor: function () {
                    return _0x4602f6["visibleAreaColor"];
                  },
                  disVisibleColor: function () {
                    return _0x4602f6["hiddenAreaColor"];
                  },
                  mixNum: function () {
                    return _0x4602f6["alpha"];
                  },
                  stcshadow: function () {
                    return _0x31dbc7["viewShadowMap"]["_shadowMapTexture"];
                  },
                  _shadowMap_matrix: function () {
                    return _0x31dbc7["viewShadowMap"]["_shadowMapMatrix"];
                  },
                  shadowMap_lightPositionEC: function () {
                    return _0x31dbc7["viewShadowMap"]["_lightPositionEC"];
                  },
                  shadowMap_lightDirectionEC: function () {
                    return _0x31dbc7["viewShadowMap"]["_lightDirectionEC"];
                  },
                  shadowMap_lightUp: function () {
                    return _0x31dbc7["viewShadowMap"]["_lightCamera"]["up"];
                  },
                  shadowMap_lightDir: function () {
                    return _0x31dbc7["viewShadowMap"]["_lightCamera"][
                      "direction"
                    ];
                  },
                  shadowMap_lightRight: function () {
                    return _0x31dbc7["viewShadowMap"]["_lightCamera"]["right"];
                  },
                  shadowMap_texelSizeDepthBiasAndNormalShadingSmooth:
                    function () {
                      var _0x4602f6 = new Cesium["Cartesian2"]();
                      return (
                        (_0x4602f6["x"] = _0x5a0ceb["dbcSd"](
                          0x1,
                          _0x31dbc7["viewShadowMap"]["_textureSize"]["x"]
                        )),
                        (_0x4602f6["y"] = _0x5a0ceb["gizUv"](
                          0x1,
                          _0x31dbc7["viewShadowMap"]["_textureSize"]["y"]
                        )),
                        Cesium["Cartesian4"]["fromElements"](
                          _0x4602f6["x"],
                          _0x4602f6["y"],
                          _0x535700["depthBias"],
                          _0x535700["normalShadingSmooth"],
                          this["combinedUniforms1"]
                        )
                      );
                    },
                  shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness:
                    function () {
                      return Cesium["Cartesian4"]["fromElements"](
                        _0x535700["normalOffsetScale"],
                        _0x31dbc7["viewShadowMap"]["_distance"],
                        _0x31dbc7["viewShadowMap"]["maximumDistance"],
                        _0x31dbc7["viewShadowMap"]["_darkness"],
                        this["combinedUniforms2"]
                      );
                    },
                },
              })
            );
          },
        },
        {
          key: _0x10b9e7["rLnie"],
          value: function () {
            this["viewer"]["entities"]["remove"](this["radar"]);
          },
        },
        {
          key: _0x10b9e7["SsJId"],
          value: function () {
            this["removeRadar"](),
              this["addRadar"](
                this["cameraPosition"],
                this["frustumQuaternion"]
              );
          },
        },
        {
          key: _0x10b9e7["jhBcL"],
          value: function (_0x134044, _0x2620b4) {
            var _0x11e3e6 = _0x134044,
              _0x535700 = this;
            this["radar"] = this["viewer"]["entities"]["add"]({
              position: _0x11e3e6,
              orientation: _0x2620b4,
              rectangularSensor: new Cesium["RectangularSensorGraphics"]({
                radius: _0x535700["distance"],
                xHalfAngle: Cesium["Math"]["toRadians"](
                  _0x10b9e7["jrmUL"](_0x535700["horizontalAngle"], 0x2)
                ),
                yHalfAngle: Cesium["Math"]["toRadians"](
                  _0x10b9e7["DchsN"](_0x535700["verticalAngle"], 0x2)
                ),
                material: new Cesium["Color"](0x0, 0x1, 0x1, 0.4),
                lineColor: new Cesium["Color"](0x1, 0x1, 0x1, 0x1),
                slice: 0x8,
                showScanPlane: !0x1,
                scanPlaneColor: new Cesium["Color"](0x0, 0x1, 0x1, 0x1),
                scanPlaneMode: _0x10b9e7["WJsto"],
                scanPlaneRate: 0x3,
                showThroughEllipsoid: !0x1,
                showLateralSurfaces: !0x1,
                showDomeSurfaces: !0x1,
              }),
            });
          },
        },
        {
          key: _0x10b9e7["zrSYp"],
          value: function (_0x5cf7c3) {
            this["viewShadowMap"] &&
              _0x5cf7c3["shadowMaps"]["push"](this["viewShadowMap"]);
          },
        },
        {
          key: _0x10b9e7["mjHWw"],
          value: function () {
            this["_unbindMourseEvent"](),
              this["viewer"]["scene"]["postProcessStages"]["remove"](
                this["postProcess"]
              ),
              this["viewer"]["entities"]["remove"](this["radar"]),
              delete this["radar"],
              delete this["postProcess"],
              delete this["viewShadowMap"],
              delete this["verticalAngle"],
              delete this["viewer"],
              delete this["horizontalAngle"],
              delete this["visibleAreaColor"],
              delete this["hiddenAreaColor"],
              delete this["distance"],
              delete this["frustumQuaternion"],
              delete this["cameraPosition"],
              delete this["viewPosition"],
              delete this["alpha"];
          },
        },
        {
          key: _0x10b9e7["RhQMM"],
          get: function () {
            return this["_horizontalAngle"];
          },
          set: function (_0x2cd4f7) {
            (this["_horizontalAngle"] = _0x2cd4f7), this["resetRadar"]();
          },
        },
        {
          key: _0x10b9e7["YuPND"],
          get: function () {
            return this["_verticalAngle"];
          },
          set: function (_0x43c2b2) {
            (this["_verticalAngle"] = _0x43c2b2), this["resetRadar"]();
          },
        },
        {
          key: _0x10b9e7["esFlX"],
          get: function () {
            return this["_distance"];
          },
          set: function (_0x8ee9d5) {
            (this["_distance"] = _0x8ee9d5), this["resetRadar"]();
          },
        },
        {
          key: _0x10b9e7["mtkMO"],
          get: function () {
            return this["_visibleAreaColor"];
          },
          set: function (_0x19c46a) {
            this["_visibleAreaColor"] = _0x19c46a;
          },
        },
        {
          key: _0x10b9e7["NRhII"],
          get: function () {
            return this["_hiddenAreaColor"];
          },
          set: function (_0x23803a) {
            this["_hiddenAreaColor"] = _0x23803a;
          },
        },
        {
          key: _0x10b9e7["CawbY"],
          get: function () {
            return this["_alpha"];
          },
          set: function (_0x499f51) {
            this["_alpha"] = _0x499f51;
          },
        },
      ]),
      _0x4602f6
    );
  })();
})();
