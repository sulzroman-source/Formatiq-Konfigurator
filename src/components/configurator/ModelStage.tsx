"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  OrthographicCamera,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

import { TENT_VARIANTS } from "@/config/stretchTentConfig";
import { SeatingSetup, TentCategory, TentSize } from "@/types/stretchTent";

type ModelAssetRef = string | { path: string; sceneIndex?: number };
type ViewerMode = "perspective" | "top";
type MaterialProfile = "tentRope" | "poles" | "seating";

type ModelFilterRule = {
  sceneIndex?: number;
  includeNameHints: string[];
  excludeNameHints?: string[];
  preserveMaterialHints?: readonly string[];
};

type ModelFileSlug = "cinema" | "dinner" | "lamps" | "party" | "poles" | "tent-rope";

const MODEL_SIZE_DIRECTORIES: Record<TentSize, TentCategory> = {
  "7_5x10": "small",
  "6x9": "small",
  "8x12": "medium",
  "10x10": "medium",
  "10x15": "medium",
  "20x10": "big",
  "20x15": "big",
};

function buildModelPath(size: TentSize, slug: ModelFileSlug) {
  return `/models/formatiq/${MODEL_SIZE_DIRECTORIES[size]}/${size}/${size}-${slug}.glb`;
}

/*
TWEAK VALUES
- sceneExposure: overall scene brightness after tone mapping
- environmentIntensity: overall reflected/environment light strength on materials
*/
const TWEAK_VALUES = {
  sceneExposure: 0.92,
  environmentIntensity: 1.08,
  shadowCatcherY: -0.01,
} as const;

const UNNAMED_POLE_MATERIAL_HINTS = [
  "aluminium",
  "aluminum",
  "metal",
  "seil",
  "rope",
  "mat_0",
  "rubber",
] as const;

const UNNAMED_STANDING_TABLE_MATERIAL_HINTS = ["woven cloth", "cloth"] as const;
const UNNAMED_SOFA_MATERIAL_HINTS = ["old wood", "beige linen fabric"] as const;

const UNNAMED_CHAIR_MATERIAL_HINTS = [
  "gray white plastic",
  "fabric",
  "gold",
  "black matt",
] as const;

const PARTY_SEATING_INCLUDE_HINTS = ["standing table", "sofa", "stehpflanze"] as const;
const PARTY_SEATING_EXCLUDE_HINTS = ["stuhlkreis", "cinema chair", "podium", "tischpflanze"] as const;
const PARTY_SEATING_MATERIAL_HINTS = [
  ...UNNAMED_STANDING_TABLE_MATERIAL_HINTS,
  ...UNNAMED_SOFA_MATERIAL_HINTS,
] as const;

const DINNER_SEATING_INCLUDE_HINTS = ["stuhlkreis", "tischpflanze", "stehpflanze"] as const;
const DINNER_SEATING_EXCLUDE_HINTS = ["standing table", "sofa", "cinema chair", "podium"] as const;

const CINEMA_SEATING_INCLUDE_HINTS = ["cinema chair", "podium"] as const;
const CINEMA_SEATING_EXCLUDE_HINTS = [
  "standing table",
  "sofa",
  "tischpflanze",
  "stehpflanze",
  "stuhlkreis",
] as const;

const FILTERED_SEATING_SIZES = [
  "6x9",
  "7_5x10",
  "8x12",
  "10x10",
  "10x15",
  "20x10",
  "20x15",
] as const satisfies readonly TentSize[];

const SEATING_FILTER_RULES = Object.fromEntries(
  FILTERED_SEATING_SIZES.flatMap((size) => [
    [
      buildModelPath(size, "party"),
      {
        includeNameHints: [...PARTY_SEATING_INCLUDE_HINTS],
        excludeNameHints: [...PARTY_SEATING_EXCLUDE_HINTS],
        preserveMaterialHints: PARTY_SEATING_MATERIAL_HINTS,
      } satisfies ModelFilterRule,
    ],
    [
      buildModelPath(size, "dinner"),
      {
        includeNameHints: [...DINNER_SEATING_INCLUDE_HINTS],
        excludeNameHints: [...DINNER_SEATING_EXCLUDE_HINTS],
        preserveMaterialHints: UNNAMED_CHAIR_MATERIAL_HINTS,
      } satisfies ModelFilterRule,
    ],
    [
      buildModelPath(size, "cinema"),
      {
        includeNameHints: [...CINEMA_SEATING_INCLUDE_HINTS],
        excludeNameHints: [...CINEMA_SEATING_EXCLUDE_HINTS],
      } satisfies ModelFilterRule,
    ],
  ]),
) as Record<string, ModelFilterRule>;

/*
Some GLBs currently contain multiple embedded setups from Blender exports.
Each selected asset is filtered so only the intended configuration remains visible.
*/
const MODEL_FILTER_RULES: Record<string, ModelFilterRule> = {
  ...SEATING_FILTER_RULES,
  [buildModelPath("7_5x10", "poles")]: {
    sceneIndex: 1,
    includeNameHints: ["pole", "centerpole", "outside pole"],
    excludeNameHints: ["lampe", "lamp"],
    preserveMaterialHints: UNNAMED_POLE_MATERIAL_HINTS,
  },
  [buildModelPath("8x12", "poles")]: {
    sceneIndex: 2,
    includeNameHints: ["pole", "centerpole", "outside pole"],
    excludeNameHints: ["lampe", "lamp", "stuhl", "chair", "sofa", "standing table", "podium", "tischpflanze", "stehpflanze"],
    preserveMaterialHints: UNNAMED_POLE_MATERIAL_HINTS,
  },
  [buildModelPath("10x10", "poles")]: {
    sceneIndex: 0,
    includeNameHints: ["pole", "centerpole", "outside pole"],
    excludeNameHints: ["lampe", "lamp", "stuhl", "chair", "sofa", "standing table", "podium", "tischpflanze", "stehpflanze"],
    preserveMaterialHints: UNNAMED_POLE_MATERIAL_HINTS,
  },
  [buildModelPath("10x15", "poles")]: {
    sceneIndex: 1,
    includeNameHints: ["pole", "centerpole", "outside pole"],
    excludeNameHints: ["lampe", "lamp", "stuhl", "chair", "sofa", "standing table", "podium", "tischpflanze", "stehpflanze"],
    preserveMaterialHints: UNNAMED_POLE_MATERIAL_HINTS,
  },
  [buildModelPath("8x12", "lamps")]: {
    sceneIndex: 2,
    includeNameHints: ["lamp", "lampe"],
  },
  [buildModelPath("10x10", "lamps")]: {
    sceneIndex: 0,
    includeNameHints: ["lamp", "lampe"],
  },
  [buildModelPath("10x15", "lamps")]: {
    sceneIndex: 1,
    includeNameHints: ["lamp", "lampe"],
  },
  [buildModelPath("20x15", "lamps")]: {
    sceneIndex: 1,
    includeNameHints: ["lamp", "lampe"],
  },
};

const MODEL_PARTS: Partial<
  Record<
    TentSize,
    {
      tentRope?: ModelAssetRef;
      poles?: ModelAssetRef;
      lamps?: ModelAssetRef;
      seating?: Partial<Record<SeatingSetup, ModelAssetRef>>;
    }
  >
> = {
  "7_5x10": {
    tentRope: { path: buildModelPath("7_5x10", "tent-rope"), sceneIndex: 1 },
    poles: { path: buildModelPath("7_5x10", "poles"), sceneIndex: 1 },
    lamps: { path: buildModelPath("7_5x10", "lamps"), sceneIndex: 1 },
    seating: {
      party: buildModelPath("7_5x10", "party"),
      dinner: buildModelPath("7_5x10", "dinner"),
      kino: buildModelPath("7_5x10", "cinema"),
    },
  },
  "6x9": {
    tentRope: buildModelPath("6x9", "tent-rope"),
    poles: buildModelPath("6x9", "poles"),
    lamps: buildModelPath("6x9", "lamps"),
    seating: {
      party: buildModelPath("6x9", "party"),
      dinner: buildModelPath("6x9", "dinner"),
      kino: buildModelPath("6x9", "cinema"),
    },
  },
  "8x12": {
    tentRope: buildModelPath("8x12", "tent-rope"),
    poles: buildModelPath("8x12", "poles"),
    lamps: buildModelPath("8x12", "lamps"),
    seating: {
      party: { path: buildModelPath("8x12", "party"), sceneIndex: 2 },
      dinner: buildModelPath("8x12", "dinner"),
      kino: { path: buildModelPath("8x12", "cinema"), sceneIndex: 2 },
    },
  },
  "10x10": {
    tentRope: buildModelPath("10x10", "tent-rope"),
    poles: buildModelPath("10x10", "poles"),
    lamps: buildModelPath("10x10", "lamps"),
    seating: {
      party: { path: buildModelPath("10x10", "party"), sceneIndex: 0 },
      dinner: { path: buildModelPath("10x10", "dinner"), sceneIndex: 0 },
      kino: { path: buildModelPath("10x10", "cinema"), sceneIndex: 0 },
    },
  },
  "10x15": {
    tentRope: buildModelPath("10x15", "tent-rope"),
    poles: buildModelPath("10x15", "poles"),
    lamps: buildModelPath("10x15", "lamps"),
    seating: {
      // "party" is the legacy internal key; in the UI this option is Standing Cocktail+.
      party: { path: buildModelPath("10x15", "party"), sceneIndex: 1 },
      dinner: { path: buildModelPath("10x15", "dinner"), sceneIndex: 1 },
      kino: { path: buildModelPath("10x15", "cinema"), sceneIndex: 0 },
    },
  },
  "20x10": {
    tentRope: buildModelPath("20x10", "tent-rope"),
    poles: buildModelPath("20x10", "poles"),
    lamps: buildModelPath("20x10", "lamps"),
    seating: {
      party: buildModelPath("20x10", "party"),
      dinner: buildModelPath("20x10", "dinner"),
      kino: buildModelPath("20x10", "cinema"),
    },
  },
  "20x15": {
    tentRope: { path: buildModelPath("20x15", "tent-rope"), sceneIndex: 1 },
    poles: { path: buildModelPath("20x15", "poles"), sceneIndex: 1 },
    lamps: { path: buildModelPath("20x15", "lamps"), sceneIndex: 1 },
    seating: {
      party: { path: buildModelPath("20x15", "party"), sceneIndex: 1 },
      dinner: { path: buildModelPath("20x15", "dinner"), sceneIndex: 1 },
      kino: { path: buildModelPath("20x15", "cinema"), sceneIndex: 1 },
    },
  },
};

const KNOWN_MODEL_PATHS = Array.from(
  new Set(
    Object.values(MODEL_PARTS)
      .flatMap((parts) => [
        getAssetPath(parts?.tentRope),
        getAssetPath(parts?.poles),
        getAssetPath(parts?.lamps),
        ...Object.values(parts?.seating ?? {}).map((asset) => getAssetPath(asset)),
      ])
      .filter((path): path is string => Boolean(path)),
  ),
);

const MODEL_CACHE_CLEANUP_DELAY_MS = 5_000;

interface ModelStageProps {
  lightsEnabled: boolean;
  selectedSize: TentSize;
  selectedSeating: SeatingSetup;
}

const CATEGORY_VIEW_PRESETS: Record<
  TentCategory,
  {
    perspectivePosition: [number, number, number];
    perspectiveTarget: [number, number, number];
    perspectiveMinDistance: number;
    perspectiveMaxDistance: number;
    topCameraY: number;
    topZoom: number;
  }
> = {
  small: {
    perspectivePosition: [7.6, 4.8, 13.8],
    perspectiveTarget: [0, 2.4, 0],
    perspectiveMinDistance: 4,
    perspectiveMaxDistance: 24,
    topCameraY: 24,
    topZoom: 42,
  },
  medium: {
    perspectivePosition: [10.4, 6, 18.8],
    perspectiveTarget: [0, 2.9, 0],
    perspectiveMinDistance: 6,
    perspectiveMaxDistance: 32,
    topCameraY: 30,
    topZoom: 32,
  },
  big: {
    perspectivePosition: [14.4, 8.2, 28],
    perspectiveTarget: [0, 3.4, 0],
    perspectiveMinDistance: 10,
    perspectiveMaxDistance: 42,
    topCameraY: 42,
    topZoom: 22,
  },
};

function getAssetPath(asset: ModelAssetRef | undefined) {
  if (!asset) {
    return undefined;
  }

  return typeof asset === "string" ? asset : asset.path;
}

function getAssetScene(
  gltf: { scene: THREE.Group; scenes: THREE.Group[] },
  asset: ModelAssetRef,
) {
  if (typeof asset === "string") {
    return gltf.scene;
  }

  return gltf.scenes[asset.sceneIndex ?? 0] ?? gltf.scene;
}

function getModelFilterRule(asset: ModelAssetRef | undefined) {
  const path = getAssetPath(asset);
  if (!path) {
    return undefined;
  }

  return MODEL_FILTER_RULES[path];
}

function getResolvedAsset(asset: ModelAssetRef | undefined) {
  if (!asset) {
    return undefined;
  }

  const path = getAssetPath(asset)!;
  const rule = getModelFilterRule(asset);

  if (!rule || rule.sceneIndex === undefined || typeof asset !== "string") {
    return asset;
  }

  return { path, sceneIndex: rule.sceneIndex };
}

function hasMaterialNameHint(object: THREE.Object3D, hints: readonly string[]) {
  let matched = false;

  object.traverse((node) => {
    if (matched || !(node instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(node.material) ? node.material : [node.material];
    matched = materials.some((material) => {
      const materialName = material?.name?.toLowerCase() ?? "";
      return hints.some((hint) => materialName.includes(hint));
    });
  });

  return matched;
}

function normalizeNodeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[_./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function filterSceneByNameHints(
  object: THREE.Object3D,
  nameHints: string[],
  options?: { preserveMaterialHints?: readonly string[] },
) {
  const normalizedHints = nameHints.map((hint) => normalizeNodeName(hint));

  const shouldKeep = (node: THREE.Object3D): boolean => {
    const nodeName = normalizeNodeName(node.name);
    const nameMatch = normalizedHints.some((hint) => nodeName.includes(hint));
    const materialMatch =
      options?.preserveMaterialHints?.length &&
      hasMaterialNameHint(node, options.preserveMaterialHints);
    const childMatch = node.children.some((child) => shouldKeep(child));

    return nameMatch || materialMatch || childMatch;
  };

  object.children = object.children.filter((child) => shouldKeep(child));
}

function removeSceneByNameHints(object: THREE.Object3D, nameHints: string[]) {
  const normalizedHints = nameHints.map((hint) => normalizeNodeName(hint));
  const nodesToRemove: THREE.Object3D[] = [];

  object.traverse((node) => {
    if (!node.parent) {
      return;
    }

    const nodeName = normalizeNodeName(node.name);
    const shouldRemove = normalizedHints.some((hint) => nodeName.includes(hint));

    if (shouldRemove) {
      nodesToRemove.push(node);
    }
  });

  nodesToRemove.forEach((node) => {
    node.removeFromParent();
  });
}

function enableShadows(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function tuneTexture(texture: THREE.Texture | null | undefined) {
  if (!texture) {
    return;
  }

  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
}

function tuneMaterialTextures(material: THREE.Material) {
  if (!("map" in material)) {
    return;
  }

  const typedMaterial = material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
  [
    typedMaterial.map,
    typedMaterial.aoMap,
    typedMaterial.alphaMap,
    typedMaterial.bumpMap,
    typedMaterial.displacementMap,
    typedMaterial.emissiveMap,
    typedMaterial.lightMap,
    typedMaterial.metalnessMap,
    typedMaterial.normalMap,
    typedMaterial.roughnessMap,
  ].forEach((texture) => tuneTexture(texture));
}

function tuneStandardLikeMaterial(
  material: THREE.Material,
  profile: MaterialProfile,
) {
  if (
    !("roughness" in material) ||
    !("metalness" in material) ||
    !("envMapIntensity" in material)
  ) {
    return;
  }

  const source = material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
  const tuned =
    source instanceof THREE.MeshPhysicalMaterial
      ? source
      : new THREE.MeshPhysicalMaterial();

  if (tuned !== source) {
    tuned.name = source.name;
    tuned.color.copy(source.color);
    tuned.map = source.map;
    tuned.aoMap = source.aoMap;
    tuned.alphaMap = source.alphaMap;
    tuned.bumpMap = source.bumpMap;
    tuned.bumpScale = source.bumpScale;
    tuned.displacementMap = source.displacementMap;
    tuned.displacementScale = source.displacementScale;
    tuned.displacementBias = source.displacementBias;
    tuned.emissive.copy(source.emissive);
    tuned.emissiveMap = source.emissiveMap;
    tuned.emissiveIntensity = source.emissiveIntensity;
    tuned.lightMap = source.lightMap;
    tuned.lightMapIntensity = source.lightMapIntensity;
    tuned.metalnessMap = source.metalnessMap;
    tuned.normalMap = source.normalMap;
    tuned.normalMapType = source.normalMapType;
    tuned.normalScale.copy(source.normalScale);
    tuned.roughnessMap = source.roughnessMap;
    tuned.transparent = source.transparent;
    tuned.opacity = source.opacity;
    tuned.side = source.side;
    tuned.depthWrite = source.depthWrite;
    tuned.depthTest = source.depthTest;
    tuned.envMap = source.envMap;
    tuned.flatShading = source.flatShading;
    tuned.wireframe = source.wireframe;
  }

  tuned.roughness = source.roughness ?? 0.7;
  tuned.metalness = source.metalness ?? 0;
  tuned.envMapIntensity = TWEAK_VALUES.environmentIntensity;
  tuned.clearcoat = 0;
  tuned.clearcoatRoughness = 0;

  if (profile === "tentRope") {
    tuned.metalness = 0;
    tuned.roughness = Math.max(0.86, tuned.roughness ?? 0.86);
    tuned.clearcoat = 0.015;
    tuned.clearcoatRoughness = 1;
    tuned.envMapIntensity = 0.58 * TWEAK_VALUES.environmentIntensity;
    tuned.side = THREE.DoubleSide;

    if ("normalScale" in tuned && tuned.normalScale) {
      tuned.normalScale.set(0.36, 0.36);
    }
  }

  if (profile === "poles") {
    tuned.metalness = Math.min(0.22, tuned.metalness ?? 0.22);
    tuned.roughness = Math.max(0.48, tuned.roughness ?? 0.48);
    tuned.envMapIntensity = 1.05 * TWEAK_VALUES.environmentIntensity;
  }

  if (profile === "seating") {
    tuned.metalness = Math.min(0.06, tuned.metalness ?? 0.06);
    tuned.roughness = Math.max(0.72, tuned.roughness ?? 0.72);
    tuned.envMapIntensity = 0.68 * TWEAK_VALUES.environmentIntensity;
    tuned.side = THREE.DoubleSide;
    tuned.depthWrite = true;

    if ("opacity" in tuned && tuned.opacity >= 0.99) {
      tuned.transparent = false;
      tuned.opacity = 1;
    }

    if ("normalScale" in tuned && tuned.normalScale) {
      tuned.normalScale.set(0.52, 0.52);
    }
  }

  tuned.needsUpdate = true;
}

function tuneObjectMaterials(object: THREE.Object3D, profile: MaterialProfile) {
  const clonedMaterialMap = new Map<THREE.Material, THREE.Material>();

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const cloneMaterial = (material: THREE.Material | undefined) => {
      if (!material) {
        return material;
      }

      const existingClone = clonedMaterialMap.get(material);
      if (existingClone) {
        return existingClone;
      }

      const cloned = material.clone();
      cloned.userData = {
        ...cloned.userData,
        configuratorClonedMaterial: true,
      };
      tuneMaterialTextures(cloned);
      tuneStandardLikeMaterial(cloned, profile);
      clonedMaterialMap.set(material, cloned);
      return cloned;
    };

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => cloneMaterial(material));
    } else {
      child.material = cloneMaterial(child.material) ?? child.material;
    }
  });
}

function disposeConfiguratorClonedMaterials(object: THREE.Object3D) {
  const disposedMaterials = new Set<THREE.Material>();

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (
        material?.userData.configuratorClonedMaterial &&
        !disposedMaterials.has(material)
      ) {
        disposedMaterials.add(material);
        material.dispose();
      }
    });
  });
}

function applyModelFilter(object: THREE.Object3D, asset: ModelAssetRef | undefined) {
  const rule = getModelFilterRule(asset);
  if (!rule) {
    return;
  }

  filterSceneByNameHints(object, rule.includeNameHints, {
    preserveMaterialHints: rule.preserveMaterialHints,
  });
  if (rule.excludeNameHints?.length) {
    removeSceneByNameHints(object, rule.excludeNameHints);
  }
}

function applyModelCorrections(object: THREE.Object3D, asset: ModelAssetRef | undefined) {
  const path = getAssetPath(asset);
  if (!path) {
    return;
  }

  if (path === buildModelPath("6x9", "party")) {
    object.children.forEach((node) => {
      const isStandingTableNode =
        normalizeNodeName(node.name).includes("standing table") ||
        hasMaterialNameHint(node, UNNAMED_STANDING_TABLE_MATERIAL_HINTS);

      if (!isStandingTableNode) {
        return;
      }

      node.position.y -= 1.12;
    });
  }

  if (path === buildModelPath("20x15", "party")) {
    object.traverse((node) => {
      if (!/stehpflanze/i.test(node.name)) {
        return;
      }

      node.scale.multiplyScalar(0.6);
    });
  }
}

function PerspectiveScene({
  tentRopeAsset,
  polesAsset,
  seatingAsset,
  lampsAsset,
}: {
  tentRopeAsset: ModelAssetRef;
  polesAsset?: ModelAssetRef;
  seatingAsset: ModelAssetRef;
  lampsAsset?: ModelAssetRef;
}) {
  const resolvedTentRopeAsset = getResolvedAsset(tentRopeAsset)!;
  const resolvedPolesAsset = getResolvedAsset(polesAsset);
  const resolvedSeatingAsset = getResolvedAsset(seatingAsset)!;
  const resolvedLampsAsset = getResolvedAsset(lampsAsset);
  const tentRopeModelPath = getAssetPath(resolvedTentRopeAsset)!;
  const polesModelPath = getAssetPath(resolvedPolesAsset);
  const seatingModelPath = getAssetPath(resolvedSeatingAsset)!;
  const lampsModelPath = getAssetPath(resolvedLampsAsset);

  const tentRopeGltf = useGLTF(tentRopeModelPath);
  const polesGltf = useGLTF(polesModelPath ?? tentRopeModelPath);
  const seatingGltf = useGLTF(seatingModelPath);
  const lampsGltf = useGLTF(lampsModelPath ?? tentRopeModelPath);

  const normalizedGroup = useMemo(() => {
    const tentRopeSource = getAssetScene(tentRopeGltf, resolvedTentRopeAsset);
    const polesSource = resolvedPolesAsset
      ? getAssetScene(polesGltf, resolvedPolesAsset)
      : null;
    const seatingSource = getAssetScene(seatingGltf, resolvedSeatingAsset);
    const lampsSource = resolvedLampsAsset
      ? getAssetScene(lampsGltf, resolvedLampsAsset)
      : null;

    const tentRopeClone = tentRopeSource.clone(true);
    const polesClone =
      polesSource && polesModelPath && polesModelPath !== tentRopeModelPath
        ? polesSource.clone(true)
        : null;
    const seatingClone = seatingSource.clone(true);
    const lampsClone =
      lampsSource && lampsModelPath && lampsModelPath !== tentRopeModelPath
        ? lampsSource.clone(true)
        : null;
    const group = new THREE.Group();

    enableShadows(tentRopeClone);
    tuneObjectMaterials(tentRopeClone, "tentRope");

    if (polesClone) {
      enableShadows(polesClone);
      applyModelFilter(polesClone, resolvedPolesAsset);
      tuneObjectMaterials(polesClone, "poles");
    }

    enableShadows(seatingClone);
    applyModelFilter(seatingClone, resolvedSeatingAsset);
    applyModelCorrections(seatingClone, resolvedSeatingAsset);
    tuneObjectMaterials(seatingClone, "seating");

    if (lampsClone) {
      enableShadows(lampsClone);
      applyModelFilter(lampsClone, resolvedLampsAsset);
    }

    group.add(tentRopeClone);
    if (polesClone) {
      group.add(polesClone);
    }
    group.add(seatingClone);
    if (lampsClone) {
      group.add(lampsClone);
    }
    group.updateMatrixWorld(true);

    const centerBounds = new THREE.Box3().setFromObject(tentRopeClone);
    const groundBounds = new THREE.Box3().setFromObject(polesClone ?? tentRopeClone);
    const center = centerBounds.getCenter(new THREE.Vector3());
    const minY = groundBounds.min.y;
    const offset = new THREE.Vector3(-center.x, -minY - 0.04, -center.z);

    group.position.copy(offset);
    return group;
  }, [
    resolvedLampsAsset,
    lampsGltf,
    lampsModelPath,
    resolvedPolesAsset,
    polesGltf,
    polesModelPath,
    resolvedSeatingAsset,
    seatingGltf,
    resolvedTentRopeAsset,
    tentRopeGltf,
    tentRopeModelPath,
  ]);

  useEffect(() => {
    return () => {
      disposeConfiguratorClonedMaterials(normalizedGroup);
    };
  }, [normalizedGroup]);

  return (
    <primitive object={normalizedGroup} />
  );
}

function TopScene({
  seatingAsset,
  polesAsset,
  lampsAsset,
}: {
  seatingAsset: ModelAssetRef;
  polesAsset?: ModelAssetRef;
  lampsAsset?: ModelAssetRef;
}) {
  const seatingModelPath = getAssetPath(seatingAsset)!;
  const resolvedPolesAsset = getResolvedAsset(polesAsset);
  const resolvedLampsAsset = getResolvedAsset(lampsAsset);
  const polesModelPath = getAssetPath(resolvedPolesAsset);
  const lampsModelPath = getAssetPath(resolvedLampsAsset);
  const seatingGltf = useGLTF(seatingModelPath);
  const polesGltf = useGLTF(polesModelPath ?? seatingModelPath);
  const lampsGltf = useGLTF(lampsModelPath ?? seatingModelPath);
  const resolvedSeatingAsset = getResolvedAsset(seatingAsset)!;

  const normalizedGroup = useMemo(() => {
    const seatingSource = getAssetScene(seatingGltf, resolvedSeatingAsset);
    const polesSource = resolvedPolesAsset
      ? getAssetScene(polesGltf, resolvedPolesAsset)
      : null;
    const lampsSource = resolvedLampsAsset
      ? getAssetScene(lampsGltf, resolvedLampsAsset)
      : null;
    const seatingClone = seatingSource.clone(true);
    const polesClone =
      polesSource && polesModelPath && polesModelPath !== seatingModelPath
        ? polesSource.clone(true)
        : null;
    const lampsClone =
      lampsSource && lampsModelPath && lampsModelPath !== seatingModelPath
        ? lampsSource.clone(true)
        : null;
    const group = new THREE.Group();

    if (polesClone) {
      enableShadows(polesClone);
      applyModelFilter(polesClone, resolvedPolesAsset);
      tuneObjectMaterials(polesClone, "poles");
      group.add(polesClone);
    }

    if (lampsClone) {
      enableShadows(lampsClone);
      applyModelFilter(lampsClone, resolvedLampsAsset);
      group.add(lampsClone);
    }

    enableShadows(seatingClone);
    applyModelFilter(seatingClone, resolvedSeatingAsset);
    applyModelCorrections(seatingClone, resolvedSeatingAsset);
    tuneObjectMaterials(seatingClone, "seating");

    group.add(seatingClone);
    group.updateMatrixWorld(true);

    const centerBounds = new THREE.Box3().setFromObject(polesClone ?? seatingClone);
    const groundBounds = new THREE.Box3().setFromObject(polesClone ?? group);
    const center = centerBounds.getCenter(new THREE.Vector3());
    const minY = groundBounds.min.y;

    group.position.set(-center.x, -minY - 0.04, -center.z);

    return group;
  }, [
    lampsGltf,
    lampsModelPath,
    polesGltf,
    polesModelPath,
    resolvedLampsAsset,
    resolvedPolesAsset,
    resolvedSeatingAsset,
    seatingGltf,
    seatingModelPath,
  ]);

  useEffect(() => {
    return () => {
      disposeConfiguratorClonedMaterials(normalizedGroup);
    };
  }, [normalizedGroup]);

  return <primitive object={normalizedGroup} />;
}

function ShowroomBackdrop({ size }: { size: number }) {
  const shadowSize = size * 0.72;
  const roomWidth = shadowSize;
  const roomDepth = shadowSize;
  const roomHeight = shadowSize * 0.48;
  const floorY = TWEAK_VALUES.shadowCatcherY - 0.004;
  const wallMaterial = (
    <meshStandardMaterial
      color="#d8cab8"
      roughness={0.94}
      metalness={0}
      envMapIntensity={0.12}
    />
  );
  const floorMaterial = (
    <meshStandardMaterial
      color="#d2c0aa"
      roughness={0.9}
      metalness={0}
      envMapIntensity={0.16}
    />
  );

  return (
    <group>
      <mesh position={[0, floorY - 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomDepth]} />
        {floorMaterial}
      </mesh>
      <mesh position={[0, roomHeight / 2 + floorY, -roomDepth / 2]} receiveShadow>
        <planeGeometry args={[roomWidth, roomHeight]} />
        {wallMaterial}
      </mesh>
      <mesh
        position={[-roomWidth / 2, roomHeight / 2 + floorY, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        {wallMaterial}
      </mesh>
      <mesh
        position={[roomWidth / 2, roomHeight / 2 + floorY, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        {wallMaterial}
      </mesh>
    </group>
  );
}

function StudioEnvironment() {
  return (
    <Environment resolution={32}>
      <group rotation={[Math.PI / 4, 0, 0]}>
        <Lightformer
          form="rect"
          intensity={1.6 * TWEAK_VALUES.environmentIntensity}
          color="#fff3e0"
          position={[0, 7, -10]}
          scale={[18, 18, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.95 * TWEAK_VALUES.environmentIntensity}
          color="#ffd7a8"
          position={[-8, 4, 6]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.55 * TWEAK_VALUES.environmentIntensity}
          color="#dbe7ff"
          position={[9, 3, -2]}
          scale={[9, 9, 1]}
        />
      </group>
    </Environment>
  );
}

function MissingModelStage({
  selectedSize,
  selectedSeating,
}: Pick<ModelStageProps, "selectedSize" | "selectedSeating">) {
  const variant = TENT_VARIANTS[selectedSize];

  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-xl rounded-3xl border border-black/5 bg-white/70 p-6 text-center shadow-card backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">
          3D Stage
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink">
          {variant.label} wird vorbereitet
        </h3>
        <p className="mt-4 text-sm leading-7 text-ink/65">
          Fuer diese Groesse liegt aktuell noch kein eigenes GLB fuer den
          fliegenden Aufbau mit {selectedSeating}-Bestuhlung im Projektordner.
          Die Kategorie- und Groessenauswahl ist bereits aktiv, das 3D-Modell
          kann spaeter direkt ergaenzt werden.
        </p>
      </div>
    </div>
  );
}

export function ModelStage({
  lightsEnabled,
  selectedSize,
  selectedSeating,
}: ModelStageProps) {
  const [viewerMode, setViewerMode] = useState<ViewerMode>("perspective");
  const variant = TENT_VARIANTS[selectedSize];
  const viewPreset = CATEGORY_VIEW_PRESETS[variant.category];
  const modelParts = MODEL_PARTS[selectedSize];
  const tentRopeAsset = modelParts?.tentRope;
  const polesAsset = modelParts?.poles;
  const seatingAsset = modelParts?.seating?.[selectedSeating];
  const lampsAsset = lightsEnabled ? modelParts?.lamps : undefined;
  const tentRopeModelPath = getAssetPath(tentRopeAsset);
  const seatingModelPath = getAssetPath(seatingAsset);
  const hasPerspectiveScene = Boolean(tentRopeModelPath && seatingModelPath);
  const hasTopScene = Boolean(seatingModelPath && polesAsset);
  const hasScene =
    viewerMode === "perspective" ? hasPerspectiveScene : hasTopScene;
  const shadowCatcherSize =
    variant.category === "big" ? 90 : variant.category === "medium" ? 68 : 48;
  const activeModelPaths = useMemo(() => {
    const activeAssets =
      viewerMode === "perspective"
        ? [tentRopeAsset, polesAsset, seatingAsset, lampsAsset]
        : [polesAsset, seatingAsset, lampsAsset];

    return new Set(
      activeAssets
        .map((asset) => getAssetPath(asset))
        .filter((path): path is string => Boolean(path)),
    );
  }, [viewerMode, tentRopeAsset, polesAsset, seatingAsset, lampsAsset]);
  useEffect(() => {
    const cleanupTimer = window.setTimeout(() => {
      KNOWN_MODEL_PATHS.forEach((path) => {
        if (!activeModelPaths.has(path)) {
          useGLTF.clear(path);
        }
      });
    }, MODEL_CACHE_CLEANUP_DELAY_MS);

    return () => {
      window.clearTimeout(cleanupTimer);
    };
  }, [activeModelPaths]);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-moss shadow-soft">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(247,147,0,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.1))]" />

      <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-orange">
            3D Stage
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
            Fliegender Aufbau nach Kategorie und Groesse
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur">
          {variant.label}
        </span>
      </div>

      <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
            Viewer
          </p>
          <p className="mt-2 text-sm font-semibold text-white/60">
            In der Draufsicht werden Bestuhlung, Poles und aktive Lampen gezeigt.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.08] p-1">
          <button
            type="button"
            onClick={() => setViewerMode("perspective")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              viewerMode === "perspective"
                ? "bg-orange text-white"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            Perspektive
          </button>
          <button
            type="button"
            onClick={() => setViewerMode("top")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              viewerMode === "top"
                ? "bg-orange text-white"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            Draufsicht
          </button>
        </div>
      </div>

      <div className="relative h-[360px] w-full md:h-[480px]">
        {hasScene &&
        seatingModelPath &&
        (viewerMode === "top" || tentRopeModelPath) ? (
          <Canvas
            dpr={1}
            frameloop="demand"
            shadows={viewerMode === "perspective"}
            gl={{
              antialias: false,
              alpha: false,
              powerPreference: "default",
              stencil: false,
            }}
            onCreated={({ gl }) => {
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = viewerMode === "perspective"
                ? TWEAK_VALUES.sceneExposure
                : 1;
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              if ("useLegacyLights" in gl) {
                (gl as THREE.WebGLRenderer & { useLegacyLights?: boolean }).useLegacyLights = false;
              }
            }}
            >
            {viewerMode === "perspective" ? (
              <>
                <color attach="background" args={["#d8cab8"]} />
                <fog attach="fog" args={["#d8cab8", 92, 190]} />
                <PerspectiveCamera
                  makeDefault
                  position={viewPreset.perspectivePosition}
                  fov={28}
                />
                <ambientLight intensity={0.22} color="#fff1df" />
                <StudioEnvironment />
                <directionalLight
                  position={[-11, 7.5, 7]}
                  intensity={3.15}
                  castShadow
                  shadow-bias={-0.00006}
                  shadow-normalBias={0.01}
                  shadow-radius={8}
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                  shadow-camera-left={-42}
                  shadow-camera-right={42}
                  shadow-camera-top={42}
                  shadow-camera-bottom={-42}
                  shadow-camera-near={0.5}
                  shadow-camera-far={120}
                  color="#ffd9a6"
                />
                <directionalLight
                  position={[9, 5.4, -8]}
                  intensity={0.16}
                  color="#d2dcff"
                />
                <directionalLight
                  position={[0, 8, -12]}
                  intensity={0.22}
                  color="#fff5e6"
                />
              </> 
            ) : (
              <>
                <color attach="background" args={["#edf2f6"]} />
                <OrthographicCamera
                  makeDefault
                  position={[0, viewPreset.topCameraY, 0.01]}
                  zoom={viewPreset.topZoom}
                  near={0.1}
                  far={100}
                />
                <ambientLight intensity={1.25} color="#eef6ff" />
                <directionalLight position={[0, 12, 4]} intensity={0.8} color="#fff9e6" />
              </>
            )}

              <Suspense fallback={null}>
                {viewerMode === "perspective" && tentRopeModelPath ? (
                  <>
                    <ShowroomBackdrop size={shadowCatcherSize} />
                    <PerspectiveScene
                      tentRopeAsset={tentRopeAsset!}
                      polesAsset={polesAsset}
                      seatingAsset={seatingAsset!}
                      lampsAsset={lampsAsset}
                    />
                  </>
                ) : (
                  <TopScene
                    seatingAsset={seatingAsset!}
                    polesAsset={polesAsset}
                    lampsAsset={lampsAsset}
                  />
                )}
              </Suspense>

            <OrbitControls
              enablePan={viewerMode === "top"}
              enableRotate={viewerMode === "perspective"}
              enableZoom
              enableDamping={viewerMode === "top"}
              dampingFactor={0.08}
              rotateSpeed={0.7}
              target={viewPreset.perspectiveTarget}
              minDistance={
                viewerMode === "top" ? 4 : viewPreset.perspectiveMinDistance
              }
              maxDistance={
                viewerMode === "top" ? 40 : viewPreset.perspectiveMaxDistance
              }
              minPolarAngle={viewerMode === "top" ? 0 : Math.PI / 4}
              maxPolarAngle={viewerMode === "top" ? 0 : Math.PI / 1.85}
              minAzimuthAngle={viewerMode === "top" ? -Infinity : -Infinity}
              maxAzimuthAngle={viewerMode === "top" ? Infinity : Infinity}
            />
          </Canvas>
        ) : (
          <MissingModelStage
            selectedSize={selectedSize}
            selectedSeating={selectedSeating}
          />
        )}
      </div>

      <div className="relative border-t border-white/10 px-6 py-4">
        <p className="text-sm font-semibold leading-6 text-white/60">
          Small startet standardmaessig. Beim Wechsel auf Medium oder Big werden
          jeweils nur die dazugehoerigen Zeltgroessen angezeigt. Vorhandene
          Blender-Modelle werden direkt geladen. Die Draufsicht zeigt die
          Bestuhlung, Poles und aktive Lampen von oben ohne Zeltplane und Seile.
        </p>
      </div>
    </section>
  );
}

