/**
 * База данных мебели и объектов для анализа фотографий
 * Содержит JSON-определения всех типов мебели, которые GPT должен искать на фотографиях
 */

// Спальная мебель
export const BEDROOM_FURNITURE = {
  bed: {
    single: {
      type: "bed",
      subtype: "single",
      position: { x: 0, y: 0 }, // будет заполняться при анализе
      size: { width: 200, height: 100 },
      rotation: 0,
      metadata: {
        material: "fabric",
        color: "#B5651D",
        label: "Односпальная кровать",
        room_types: ["спальня", "детская", "гостевая"]
      }
    },
    double: {
      type: "bed",
      subtype: "double",
      position: { x: 0, y: 0 },
      size: { width: 200, height: 140 },
      rotation: 0,
      metadata: {
        material: "fabric", 
        color: "#B5651D",
        label: "Двуспальная кровать",
        room_types: ["спальня"]
      }
    },
    king_size: {
      type: "bed",
      subtype: "king_size",
      position: { x: 0, y: 0 },
      size: { width: 200, height: 180 },
      rotation: 0,
      metadata: {
        material: "fabric",
        color: "#B5651D", 
        label: "Большая кровать",
        room_types: ["спальня"]
      }
    }
  },
  
  wardrobe: {
    sliding_doors: {
      type: "wardrobe",
      subtype: "sliding_doors",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 60 },
      rotation: 0,
      metadata: {
        doors: 2,
        material: "laminated_board",
        color: "#F5DEB3",
        label: "Шкаф-купе",
        room_types: ["спальня", "прихожая", "гостиная"]
      }
    },
    swing_doors: {
      type: "wardrobe",
      subtype: "swing_doors", 
      position: { x: 0, y: 0 },
      size: { width: 100, height: 60 },
      rotation: 0,
      metadata: {
        doors: 3,
        material: "laminated_board",
        color: "#F5DEB3",
        label: "Распашной шкаф",
        room_types: ["спальня", "детская", "гостиная"]
      }
    }
  },

  nightstand: {
    standard: {
      type: "nightstand",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 50, height: 40 },
      rotation: 0,
      metadata: {
        drawers: 2,
        material: "wood",
        color: "#8B4513",
        label: "Прикроватная тумба",
        room_types: ["спальня"]
      }
    }
  },

  dresser: {
    standard: {
      type: "dresser",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 50 },
      rotation: 0,
      metadata: {
        drawers: 6,
        material: "wood",
        color: "#8B4513",
        label: "Комод",
        room_types: ["спальня", "гостиная", "детская"]
      }
    }
  }
};

// Гостиная мебель  
export const LIVING_ROOM_FURNITURE = {
  sofa: {
    linear: {
      type: "sofa",
      subtype: "linear",
      position: { x: 0, y: 0 },
      size: { width: 200, height: 90 },
      rotation: 0,
      metadata: {
        seats: 3,
        material: "leather",
        color: "#8B4513",
        label: "Прямой диван",
        room_types: ["гостиная", "зал"]
      }
    },
    corner: {
      type: "sofa", 
      subtype: "corner",
      position: { x: 0, y: 0 },
      size: { width: 240, height: 180 },
      rotation: 0,
      metadata: {
        seats: 5,
        material: "fabric",
        color: "#8B4513",
        label: "Угловой диван",
        room_types: ["гостиная", "зал"]
      }
    },
    sectional: {
      type: "sofa",
      subtype: "sectional", 
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      rotation: 0,
      metadata: {
        seats: 6,
        material: "fabric",
        color: "#8B4513",
        label: "Модульный диван",
        room_types: ["гостиная", "зал"]
      }
    }
  },

  armchair: {
    standard: {
      type: "armchair",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 90 },
      rotation: 0,
      metadata: {
        seats: 1,
        material: "fabric",
        color: "#654321",
        label: "Кресло",
        room_types: ["гостиная", "спальня", "кабинет"]
      }
    },
    recliner: {
      type: "armchair",
      subtype: "recliner",
      position: { x: 0, y: 0 },
      size: { width: 90, height: 100 },
      rotation: 0,
      metadata: {
        seats: 1,
        material: "leather",
        color: "#654321",
        label: "Кресло-реклайнер",
        room_types: ["гостиная", "спальня"]
      }
    }
  },

  coffee_table: {
    standard: {
      type: "table",
      subtype: "coffee",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 60 },
      rotation: 0,
      metadata: {
        shape: "rectangle",
        material: "wood",
        label: "Журнальный столик",
        room_types: ["гостиная", "зал"]
      }
    },
    round: {
      type: "table",
      subtype: "coffee_round",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 80 },
      rotation: 0,
      metadata: {
        shape: "circle", 
        material: "glass",
        label: "Круглый журнальный столик",
        room_types: ["гостиная", "зал"]
      }
    }
  },

  tv_stand: {
    standard: {
      type: "tv_stand",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 150, height: 50 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513",
        label: "ТВ-тумба",
        room_types: ["гостиная", "спальня"]
      }
    }
  },

  bookshelf: {
    standard: {
      type: "bookshelf", 
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 200 },
      rotation: 0,
      metadata: {
        shelves: 5,
        material: "wood",
        color: "#8B4513",
        label: "Книжный шкаф",
        room_types: ["гостиная", "кабинет", "спальня"]
      }
    }
  }
};

// Столовая и кухонная мебель
export const DINING_KITCHEN_FURNITURE = {
  dining_table: {
    rectangle: {
      type: "table",
      subtype: "dining",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 80 },
      rotation: 0,
      metadata: {
        shape: "rectangle",
        material: "wood",
        chairs_count: 4,
        label: "Обеденный стол",
        room_types: ["кухня", "столовая", "гостиная"]
      }
    },
    round: {
      type: "table",
      subtype: "dining_round",
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      rotation: 0,
      metadata: {
        shape: "circle",
        material: "wood", 
        chairs_count: 4,
        label: "Круглый обеденный стол",
        room_types: ["кухня", "столовая", "гостиная"]
      }
    },
    extendable: {
      type: "table",
      subtype: "dining_extendable",
      position: { x: 0, y: 0 },
      size: { width: 160, height: 80 },
      rotation: 0,
      metadata: {
        shape: "rectangle",
        material: "wood",
        chairs_count: 6,
        extendable: true,
        label: "Раздвижной обеденный стол",
        room_types: ["кухня", "столовая", "гостиная"]
      }
    }
  },

  chair: {
    dining: {
      type: "chair",
      subtype: "dining",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 40 },
      rotation: 0,
      metadata: {
        style: "dining_chair",
        color: "#654321",
        label: "Обеденный стул",
        room_types: ["кухня", "столовая", "гостиная"]
      }
    },
    bar: {
      type: "chair",
      subtype: "bar",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 40 },
      rotation: 0,
      metadata: {
        style: "bar_chair",
        color: "#654321",
        height: "bar_height",
        label: "Барный стул",
        room_types: ["кухня"]
      }
    }
  },

  kitchen_set: {
    l_shape: {
      type: "kitchen",
      subtype: "l_shape",
      modules: [
        {
          type: "counter",
          position: { x: 0, y: 0 },
          size: { width: 200, height: 60 },
          rotation: 0
        },
        {
          type: "sink_cabinet",
          position: { x: 0, y: 0 },
          size: { width: 80, height: 60 },
          rotation: 0
        }
      ],
      metadata: {
        countertop_material: "quartz",
        color_scheme: { 
          cabinets: "#EEE8AA", 
          countertop: "#FFFFFF" 
        },
        label: "Г-образная кухня",
        room_types: ["кухня"]
      }
    },
    linear: {
      type: "kitchen",
      subtype: "linear",
      modules: [
        {
          type: "counter", 
          position: { x: 0, y: 0 },
          size: { width: 250, height: 60 },
          rotation: 0
        }
      ],
      metadata: {
        countertop_material: "laminate",
        color_scheme: {
          cabinets: "#EEE8AA",
          countertop: "#FFFFFF"
        },
        label: "Прямая кухня",
        room_types: ["кухня"]
      }
    },
    u_shape: {
      type: "kitchen",
      subtype: "u_shape", 
      modules: [
        {
          type: "counter",
          position: { x: 0, y: 0 },
          size: { width: 200, height: 60 },
          rotation: 0
        },
        {
          type: "counter",
          position: { x: 0, y: 0 },
          size: { width: 150, height: 60 },
          rotation: 90
        },
        {
          type: "counter",
          position: { x: 0, y: 0 },
          size: { width: 200, height: 60 },
          rotation: 180
        }
      ],
      metadata: {
        countertop_material: "stone",
        color_scheme: {
          cabinets: "#EEE8AA",
          countertop: "#FFFFFF"
        },
        label: "П-образная кухня",
        room_types: ["кухня"]
      }
    }
  },

  kitchen_island: {
    standard: {
      type: "kitchen_island",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 80 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513",
        label: "Кухонный остров",
        room_types: ["кухня"]
      }
    }
  }
};

// Бытовая техника
export const APPLIANCES = {
  refrigerator: {
    standard: {
      type: "appliance",
      subtype: "refrigerator",
      position: { x: 0, y: 0 },
      size: { width: 70, height: 70 },
      rotation: 0,
      metadata: {
        style: "freestanding",
        color: "#FFFFFF",
        label: "Холодильник",
        room_types: ["кухня"]
      }
    },
    side_by_side: {
      type: "appliance",
      subtype: "refrigerator_large",
      position: { x: 0, y: 0 },
      size: { width: 90, height: 70 },
      rotation: 0,
      metadata: {
        style: "side_by_side",
        color: "#FFFFFF",
        label: "Большой холодильник",
        room_types: ["кухня"]
      }
    }
  },

  washing_machine: {
    front_loading: {
      type: "appliance",
      subtype: "washing_machine",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 60 },
      rotation: 0,
      metadata: {
        brand: "Bosch",
        color: "#FFFFFF",
        front_loading: true,
        label: "Стиральная машина",
        room_types: ["ванная", "кухня", "прихожая", "балкон"]
      }
    }
  },

  dishwasher: {
    built_in: {
      type: "appliance",
      subtype: "dishwasher",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 60 },
      rotation: 0,
      metadata: {
        installation: "built_in",
        color: "#FFFFFF",
        label: "Посудомоечная машина",
        room_types: ["кухня"]
      }
    }
  },

  oven: {
    built_in: {
      type: "appliance",
      subtype: "oven",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 60 },
      rotation: 0,
      metadata: {
        installation: "built_in",
        color: "#000000",
        label: "Духовка",
        room_types: ["кухня"]
      }
    }
  },

  microwave: {
    countertop: {
      type: "appliance",
      subtype: "microwave",
      position: { x: 0, y: 0 },
      size: { width: 50, height: 30 },
      rotation: 0,
      metadata: {
        installation: "countertop",
        color: "#FFFFFF",
        label: "Микроволновка",
        room_types: ["кухня"]
      }
    }
  }
};

// Сантехника
export const BATHROOM_FIXTURES = {
  bathtub: {
    standard: {
      type: "bathroom",
      subtype: "bathtub",
      position: { x: 0, y: 0 },
      size: { width: 170, height: 80 },
      rotation: 0,
      metadata: {
        style: "standard",
        material: "acrylic",
        label: "Ванна",
        room_types: ["ванная"]
      }
    },
    freestanding: {
      type: "bathroom",
      subtype: "bathtub",
      position: { x: 0, y: 0 },
      size: { width: 170, height: 80 },
      rotation: 0,
      metadata: {
        style: "freestanding",
        material: "acrylic",
        label: "Отдельностоящая ванна",
        room_types: ["ванная"]
      }
    }
  },

  shower_cabin: {
    square: {
      type: "bathroom",
      subtype: "shower_cabin",
      position: { x: 0, y: 0 },
      size: { width: 90, height: 90 },
      rotation: 0,
      metadata: {
        shape: "square",
        glass_doors: true,
        tray_material: "acrylic",
        label: "Душевая кабина",
        room_types: ["ванная"]
      }
    },
    corner: {
      type: "bathroom",
      subtype: "shower_cabin",
      position: { x: 0, y: 0 },
      size: { width: 90, height: 90 },
      rotation: 0,
      metadata: {
        shape: "corner",
        glass_doors: true,
        tray_material: "ceramic",
        label: "Угловая душевая кабина",
        room_types: ["ванная"]
      }
    }
  },

  toilet: {
    floor_mounted: {
      type: "bathroom",
      subtype: "toilet",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 70 },
      rotation: 0,
      metadata: {
        type: "floor_mounted",
        color: "white",
        label: "Унитаз",
        room_types: ["ванная", "санузел"]
      }
    },
    wall_mounted: {
      type: "bathroom",
      subtype: "toilet",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 60 },
      rotation: 0,
      metadata: {
        type: "wall_mounted",
        color: "white",
        label: "Подвесной унитаз",
        room_types: ["ванная", "санузел"]
      }
    }
  },

  sink: {
    pedestal: {
      type: "bathroom",
      subtype: "sink",
      position: { x: 0, y: 0 },
      size: { width: 50, height: 50 },
      rotation: 0,
      metadata: {
        style: "pedestal",
        faucet_holes: 1,
        label: "Раковина на пьедестале",
        room_types: ["ванная", "санузел"]
      }
    },
    vanity: {
      type: "bathroom",
      subtype: "sink",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 50 },
      rotation: 0,
      metadata: {
        style: "vanity",
        faucet_holes: 1,
        label: "Раковина с тумбой",
        room_types: ["ванная", "санузел"]
      }
    }
  },

  bidet: {
    standard: {
      type: "bathroom",
      subtype: "bidet",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 60 },
      rotation: 0,
      metadata: {
        type: "floor_mounted",
        color: "white",
        label: "Биде",
        room_types: ["ванная"]
      }
    }
  }
};

// Офисная мебель
export const OFFICE_FURNITURE = {
  desk: {
    computer: {
      type: "desk",
      subtype: "computer",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 60 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513",
        drawers: 2,
        label: "Компьютерный стол",
        room_types: ["кабинет", "спальня", "гостиная"]
      }
    },
    writing: {
      type: "desk",
      subtype: "writing",
      position: { x: 0, y: 0 },
      size: { width: 100, height: 50 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513", 
        drawers: 1,
        label: "Письменный стол",
        room_types: ["кабинет", "спальня", "детская"]
      }
    }
  },

  office_chair: {
    ergonomic: {
      type: "chair",
      subtype: "office",
      position: { x: 0, y: 0 },
      size: { width: 50, height: 50 },
      rotation: 0,
      metadata: {
        style: "ergonomic",
        color: "#000000",
        wheels: true,
        label: "Офисное кресло",
        room_types: ["кабинет", "спальня", "гостиная"]
      }
    }
  },

  filing_cabinet: {
    standard: {
      type: "filing_cabinet",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 130 },
      rotation: 0,
      metadata: {
        drawers: 4,
        material: "metal",
        color: "#C0C0C0",
        label: "Картотечный шкаф",
        room_types: ["кабинет"]
      }
    }
  }
};

// Детская мебель
export const CHILDREN_FURNITURE = {
  crib: {
    standard: {
      type: "bed",
      subtype: "crib",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 60 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#F5DEB3",
        safety_rails: true,
        label: "Детская кроватка",
        room_types: ["детская"]
      }
    }
  },

  changing_table: {
    standard: {
      type: "changing_table",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 50 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#F5DEB3",
        storage: true,
        label: "Пеленальный столик",
        room_types: ["детская"]
      }
    }
  },

  toy_storage: {
    chest: {
      type: "toy_storage",
      subtype: "chest",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 40 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#FFB6C1",
        label: "Ящик для игрушек",
        room_types: ["детская", "гостиная"]
      }
    }
  }
};

// Дополнительная мебель
export const ADDITIONAL_FURNITURE = {
  mirror: {
    wall_mounted: {
      type: "mirror",
      subtype: "wall_mounted",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 80 },
      rotation: 0,
      metadata: {
        frame_material: "wood",
        color: "#8B4513",
        label: "Настенное зеркало",
        room_types: ["ванная", "спальня", "прихожая"]
      }
    },
    floor_standing: {
      type: "mirror",
      subtype: "floor_standing", 
      position: { x: 0, y: 0 },
      size: { width: 50, height: 150 },
      rotation: 0,
      metadata: {
        frame_material: "metal",
        color: "#C0C0C0",
        label: "Напольное зеркало",
        room_types: ["спальня", "прихожая", "гостиная"]
      }
    }
  },

  storage_bench: {
    standard: {
      type: "storage_bench",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 40 },
      rotation: 0,
      metadata: {
        material: "fabric",
        color: "#8B4513",
        storage: true,
        label: "Банкетка с ящиком",
        room_types: ["прихожая", "спальня"]
      }
    }
  },

  coat_rack: {
    floor_standing: {
      type: "coat_rack",
      subtype: "floor_standing",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 40 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513",
        hooks: 6,
        label: "Напольная вешалка",
        room_types: ["прихожая", "спальня", "кабинет"]
      }
    }
  },

  shoe_cabinet: {
    standard: {
      type: "shoe_cabinet",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 80 },
      rotation: 0,
      metadata: {
        material: "laminated_board",
        color: "#F5DEB3",
        compartments: 6,
        label: "Обувница",
        room_types: ["прихожая"]
      }
    }
  }
};

// Балконная мебель
export const BALCONY_FURNITURE = {
  outdoor_table: {
    small: {
      type: "table",
      subtype: "outdoor_small",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 60 },
      rotation: 0,
      metadata: {
        material: "plastic",
        color: "#FFFFFF",
        weather_resistant: true,
        label: "Небольшой столик",
        room_types: ["балкон", "лоджия"]
      }
    }
  },

  outdoor_chair: {
    plastic: {
      type: "chair", 
      subtype: "outdoor",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 40 },
      rotation: 0,
      metadata: {
        material: "plastic",
        color: "#FFFFFF",
        weather_resistant: true,
        label: "Пластиковый стул",
        room_types: ["балкон", "лоджия"]
      }
    }
  },

  storage_cabinet: {
    outdoor: {
      type: "storage_cabinet",
      subtype: "outdoor",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 80 },
      rotation: 0,
      metadata: {
        material: "plastic",
        color: "#CCCCCC",
        weather_resistant: true,
        label: "Шкаф для балкона",
        room_types: ["балкон", "лоджия"]
      }
    }
  },

  drying_rack: {
    standard: {
      type: "drying_rack",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 40 },
      rotation: 0,
      metadata: {
        material: "metal",
        color: "#C0C0C0",
        foldable: true,
        label: "Сушилка для белья",
        room_types: ["балкон", "лоджия", "ванная"]
      }
    }
  }
};

// Системы хранения и встроенная мебель
export const STORAGE_FURNITURE = {
  wall_shelf: {
    single: {
      type: "shelf",
      subtype: "wall_single",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 20 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513",
        wall_mounted: true,
        label: "Настенная полка",
        room_types: ["гостиная", "спальня", "кабинет", "кухня", "ванная"]
      }
    },
    multiple: {
      type: "shelf",
      subtype: "wall_multiple",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 60 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513",
        wall_mounted: true,
        shelves_count: 3,
        label: "Настенные полки",
        room_types: ["гостиная", "спальня", "кабинет", "кухня", "ванная"]
      }
    }
  },

  pantry_cabinet: {
    tall: {
      type: "pantry_cabinet",
      subtype: "tall",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 200 },
      rotation: 0,
      metadata: {
        material: "laminated_board",
        color: "#F5DEB3",
        doors: 2,
        shelves: 6,
        label: "Высокий шкаф-пенал",
        room_types: ["кухня", "ванная", "прихожая", "кладовая"]
      }
    }
  },

  linen_closet: {
    standard: {
      type: "linen_closet",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 180 },
      rotation: 0,
      metadata: {
        material: "laminated_board",
        color: "#F5DEB3",
        doors: 2,
        shelves: 4,
        label: "Бельевой шкаф",
        room_types: ["спальня", "ванная", "прихожая"]
      }
    }
  }
};

// Декоративные и дополнительные элементы
export const DECORATIVE_FURNITURE = {
  floor_lamp: {
    standard: {
      type: "floor_lamp",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 30, height: 30 },
      rotation: 0,
      metadata: {
        material: "metal",
        color: "#000000",
        light_type: "led",
        label: "Напольный торшер",
        room_types: ["гостиная", "спальня", "кабинет"]
      }
    }
  },

  table_lamp: {
    desk: {
      type: "table_lamp",
      subtype: "desk",
      position: { x: 0, y: 0 },
      size: { width: 20, height: 20 },
      rotation: 0,
      metadata: {
        material: "metal",
        color: "#000000",
        light_type: "led",
        label: "Настольная лампа",
        room_types: ["спальня", "кабинет", "гостиная"]
      }
    }
  },

  plant_stand: {
    floor: {
      type: "plant_stand",
      subtype: "floor",
      position: { x: 0, y: 0 },
      size: { width: 30, height: 30 },
      rotation: 0,
      metadata: {
        material: "wood",
        color: "#8B4513",
        height_adjustable: false,
        label: "Подставка для растений",
        room_types: ["гостиная", "спальня", "балкон", "кабинет"]
      }
    }
  },

  ottoman: {
    round: {
      type: "ottoman",
      subtype: "round",
      position: { x: 0, y: 0 },
      size: { width: 50, height: 50 },
      rotation: 0,
      metadata: {
        material: "fabric",
        color: "#8B4513",
        storage: false,
        label: "Круглый пуф",
        room_types: ["гостиная", "спальня"]
      }
    },
    storage: {
      type: "ottoman",
      subtype: "storage",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 40 },
      rotation: 0,
      metadata: {
        material: "fabric",
        color: "#8B4513",
        storage: true,
        label: "Пуф с ящиком",
        room_types: ["гостиная", "спальня", "прихожая"]
      }
    }
  }
};

// Техника и электроника
export const ELECTRONICS_FURNITURE = {
  tv: {
    wall_mounted: {
      type: "tv",
      subtype: "wall_mounted",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 70 },
      rotation: 0,
      metadata: {
        screen_size: "55_inch",
        color: "#000000",
        wall_mounted: true,
        label: "Настенный телевизор",
        room_types: ["гостиная", "спальня"]
      }
    },
    on_stand: {
      type: "tv",
      subtype: "on_stand",
      position: { x: 0, y: 0 },
      size: { width: 120, height: 70 },
      rotation: 0,
      metadata: {
        screen_size: "55_inch",
        color: "#000000",
        wall_mounted: false,
        label: "Телевизор на подставке",
        room_types: ["гостиная", "спальня"]
      }
    }
  },

  computer: {
    desktop: {
      type: "computer",
      subtype: "desktop",
      position: { x: 0, y: 0 },
      size: { width: 20, height: 40 },
      rotation: 0,
      metadata: {
        type: "desktop",
        color: "#000000",
        label: "Системный блок",
        room_types: ["кабинет", "спальня", "гостиная"]
      }
    }
  },

  monitor: {
    standard: {
      type: "monitor",
      subtype: "standard",
      position: { x: 0, y: 0 },
      size: { width: 60, height: 40 },
      rotation: 0,
      metadata: {
        screen_size: "24_inch",
        color: "#000000",
        label: "Монитор",
        room_types: ["кабинет", "спальня", "гостиная"]
      }
    }
  },

  printer: {
    desktop: {
      type: "printer",
      subtype: "desktop",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 30 },
      rotation: 0,
      metadata: {
        type: "inkjet",
        color: "#FFFFFF",
        label: "Принтер",
        room_types: ["кабинет", "гостиная"]
      }
    }
  }
};

// Сводная база данных всей мебели
export const FURNITURE_DATABASE = {
  ...BEDROOM_FURNITURE,
  ...LIVING_ROOM_FURNITURE,
  ...DINING_KITCHEN_FURNITURE,
  ...APPLIANCES,
  ...BATHROOM_FIXTURES,
  ...OFFICE_FURNITURE,
  ...CHILDREN_FURNITURE,
  ...ADDITIONAL_FURNITURE,
  ...BALCONY_FURNITURE,
  ...STORAGE_FURNITURE,
  ...DECORATIVE_FURNITURE,
  ...ELECTRONICS_FURNITURE
};

// Функция для получения всех возможных типов объектов
export function getAllFurnitureTypes() {
  const types = new Set();
  
  const addTypes = (category) => {
    Object.keys(category).forEach(itemType => {
      Object.keys(category[itemType]).forEach(subtype => {
        types.add(category[itemType][subtype].type);
      });
    });
  };

  addTypes(BEDROOM_FURNITURE);
  addTypes(LIVING_ROOM_FURNITURE);
  addTypes(DINING_KITCHEN_FURNITURE);
  addTypes(APPLIANCES);
  addTypes(BATHROOM_FIXTURES);
  addTypes(OFFICE_FURNITURE);
  addTypes(CHILDREN_FURNITURE);
  addTypes(ADDITIONAL_FURNITURE);
  addTypes(BALCONY_FURNITURE);
  addTypes(STORAGE_FURNITURE);
  addTypes(DECORATIVE_FURNITURE);
  addTypes(ELECTRONICS_FURNITURE);

  return Array.from(types);
}

// Функция для получения мебели по типу помещения
export function getFurnitureByRoomType(roomType) {
  const roomTypeLower = roomType.toLowerCase();
  const relevantFurniture = [];

  const searchInCategory = (category) => {
    Object.keys(category).forEach(itemType => {
      Object.keys(category[itemType]).forEach(subtype => {
        const item = category[itemType][subtype];
        if (item.metadata.room_types && 
            item.metadata.room_types.some(rt => roomTypeLower.includes(rt.toLowerCase()))) {
          relevantFurniture.push(item);
        }
      });
    });
  };

  searchInCategory(BEDROOM_FURNITURE);
  searchInCategory(LIVING_ROOM_FURNITURE);
  searchInCategory(DINING_KITCHEN_FURNITURE);
  searchInCategory(APPLIANCES);
  searchInCategory(BATHROOM_FIXTURES);
  searchInCategory(OFFICE_FURNITURE);
  searchInCategory(CHILDREN_FURNITURE);
  searchInCategory(ADDITIONAL_FURNITURE);
  searchInCategory(BALCONY_FURNITURE);
  searchInCategory(STORAGE_FURNITURE);
  searchInCategory(DECORATIVE_FURNITURE);
  searchInCategory(ELECTRONICS_FURNITURE);

  return relevantFurniture;
}

// Функция для создания инструкций для GPT по поиску мебели
export function generateFurnitureInstructions(roomType) {
  const relevantFurniture = getFurnitureByRoomType(roomType);
  
  if (relevantFurniture.length === 0) {
    return "В данном типе помещения искать мебель не требуется.";
  }

  let instructions = `\nИщи ТОЛЬКО следующие типы мебели и объектов для помещения "${roomType}":\n\n`;
  
  const groupedByType = {};
  relevantFurniture.forEach(item => {
    if (!groupedByType[item.type]) {
      groupedByType[item.type] = [];
    }
    groupedByType[item.type].push(item);
  });

  Object.keys(groupedByType).forEach(type => {
    instructions += `- ${type}: `;
    const descriptions = groupedByType[type].map(item => item.metadata.label);
    instructions += descriptions.join(', ') + '\n';
  });

  instructions += `\nНЕ ищи объекты, которые НЕ указаны в этом списке. Если на фото нет подходящих объектов из списка - это нормально, верни пустой массив objects.`;

  return instructions;
}
