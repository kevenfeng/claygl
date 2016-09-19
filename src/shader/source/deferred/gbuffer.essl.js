define(function () {
return "@export qtek.deferred.gbuffer.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 worldInverseTranspose : WORLDINVERSETRANSPOSE;\nuniform mat4 world : WORLD;\n\nuniform vec2 uvRepeat;\nuniform vec2 uvOffset;\n\nattribute vec3 position : POSITION;\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 normal : NORMAL;\n\n#ifdef SKINNING\nattribute vec3 weight : WEIGHT;\nattribute vec4 joint : JOINT;\n\nuniform mat4 skinMatrix[JOINT_COUNT] : SKIN_MATRIX;\n#endif\n\nvarying vec2 v_Texcoord;\nvarying vec3 v_Normal;\n\n#ifdef NORMALMAP_ENABLED\nattribute vec4 tangent : TANGENT;\nvarying vec3 v_Tangent;\nvarying vec3 v_Bitangent;\n#endif\n\nvarying vec4 v_ProjPos;\n\nvoid main()\n{\n\n    vec3 skinnedPosition = position;\n    vec3 skinnedNormal = normal;\n\n    bool hasTangent = dot(tangent, tangent) > 0.0;\n#ifdef NORMALMAP_ENABLED\n    vec3 skinnedTangent = tangent.xyz;\n#endif\n#ifdef SKINNING\n\n    @import qtek.chunk.skin_matrix\n\n    skinnedPosition = (skinMatrixWS * vec4(position, 1.0)).xyz;\n    // Upper skinMatrix\n    skinnedNormal = (skinMatrixWS * vec4(normal, 0.0)).xyz;\n#ifdef NORMALMAP_ENABLED\n    if (hasTangent) {\n        skinnedTangent = (skinMatrixWS * vec4(tangent.xyz, 0.0)).xyz;\n    }\n#endif\n#endif\n\n    gl_Position = worldViewProjection * vec4(skinnedPosition, 1.0);\n\n    v_Texcoord = texcoord * uvRepeat + uvOffset;\n\n    v_Normal = normalize((worldInverseTranspose * vec4(skinnedNormal, 0.0)).xyz);\n\n#ifdef NORMALMAP_ENABLED\n    if (hasTangent) {\n        v_Tangent = normalize((worldInverseTranspose * vec4(skinnedTangent, 0.0)).xyz);\n        v_Bitangent = normalize(cross(v_Normal, v_Tangent) * tangent.w);\n    }\n#endif\n\n    v_ProjPos = gl_Position;\n}\n\n\n@end\n\n\n@export qtek.deferred.gbuffer.fragment\n\nuniform sampler2D diffuseMap;\nuniform float glossiness;\n\nvarying vec2 v_Texcoord;\nvarying vec3 v_Normal;\n\n#ifdef NORMALMAP_ENABLED\nuniform sampler2D normalMap;\nvarying vec3 v_Tangent;\nvarying vec3 v_Bitangent;\n#endif\n\nvarying vec4 v_ProjPos;\n\nvoid main()\n{\n    vec3 N = v_Normal;\n#ifdef NORMALMAP_ENABLED\n    if (dot(v_Tangent, v_Tangent) > 0.0) {\n        N = texture2D(normalMap, v_Texcoord).xyz * 2.0 - 1.0;\n        mat3 tbn = mat3(v_Tangent, v_Bitangent, v_Normal);\n        N = tbn * N;\n    }\n#endif\n\n    gl_FragColor.rgb = (N.xyz + 1.0) * 0.5;\n\n    // N.z can be recovered from sqrt(1 - dot(N.xy, N.xy));\n\n    // Depth\n    // gl_FragColor.b = v_ProjPos.z / v_ProjPos.w;\n\n    gl_FragColor.a = glossiness;\n#ifdef DIFFUSEMAP_ENABLED\n    // Ouptut glossiness to alpha channel\n    gl_FragColor.a *= texture2D(diffuseMap, v_Texcoord).a;\n#endif\n\n    // Sign of normal z\n    // if (N.z < 0.0) {\n    //     gl_FragColor.a = -gl_FragColor.a;\n    // }\n}\n@end";
});