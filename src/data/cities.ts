import type { City } from '../models/travel'

interface CityDefinition {
  name: string
  englishName: string
  province: string
  adcode: number
  aliases?: string[]
  stampFile?: string
}

const definitions: CityDefinition[] = [
  { name: '北京', englishName: 'BEIJING', province: '北京', adcode: 110000, stampFile: 'city-beijing.png' },
  { name: '天津', englishName: 'TIANJIN', province: '天津', adcode: 120000, stampFile: 'city-tianjin.png' },
  { name: '南京', englishName: 'NANJING', province: '江苏', adcode: 320100, stampFile: 'city-nanjing.png' },
  { name: '马鞍山', englishName: 'MAANSHAN', province: '安徽', adcode: 340500, stampFile: 'city-maanshan.png' },
  { name: '济南', englishName: 'JINAN', province: '山东', adcode: 370100, stampFile: 'city-jinan.png' },
  // The supplied Qingdao stamp contains Jinan's coordinates, so it stays unavailable until corrected.
  { name: '青岛', englishName: 'QINGDAO', province: '山东', adcode: 370200 },
  { name: '日照', englishName: 'RIZHAO', province: '山东', adcode: 371100, stampFile: 'city-rizhao.png' },
  { name: '长春', englishName: 'CHANGCHUN', province: '吉林', adcode: 220100, stampFile: 'city-changchun.png' },
  { name: '吉林', englishName: 'JILIN', province: '吉林', adcode: 220200, aliases: ['吉林市'], stampFile: 'city-jilin-city.png' },
  { name: '哈尔滨', englishName: 'HARBIN', province: '黑龙江', adcode: 230100, stampFile: 'city-harbin.png' },
  { name: '齐齐哈尔', englishName: 'QIQIHAR', province: '黑龙江', adcode: 230200, stampFile: 'city-qiqihar.png' },
  { name: '大庆', englishName: 'DAQING', province: '黑龙江', adcode: 230600, stampFile: 'city-daqing.png' },
  { name: '佳木斯', englishName: 'JIAMUSI', province: '黑龙江', adcode: 230800, stampFile: 'city-jiamusi.png' },
  { name: '安达', englishName: 'ANDA', province: '黑龙江', adcode: 231281, stampFile: 'city-anda.png' },
  { name: '漠河', englishName: 'MOHE', province: '黑龙江', adcode: 232701, stampFile: 'city-mohe.png' },
  { name: '西安', englishName: "XI'AN", province: '陕西', adcode: 610100, aliases: ['西安市'], stampFile: 'city-xian.png' },
]

export function normalizeCityName(value: string) {
  return value.trim().replace(/\s+/g, '').replace(/(特别行政区|自治州|地区|盟|市)$/u, '')
}

export function cityDefinitionForName(value: string) {
  const normalized = normalizeCityName(value)
  return definitions.find(entry => [entry.name, ...(entry.aliases ?? [])].some(name => normalizeCityName(name) === normalized))
}

export function createCity(value: string): City {
  const definition = cityDefinitionForName(value)
  const normalizedName = normalizeCityName(definition?.name ?? value)
  return {
    id: definition ? `cn-${definition.adcode}` : `city-${normalizedName}`,
    name: definition?.name ?? value.trim(),
    normalizedName,
    englishName: definition?.englishName,
    province: definition?.province,
    adcode: definition?.adcode,
  }
}

export function cityStampUrl(city: City) {
  const definition = cityDefinitionForName(city.name)
  return definition?.stampFile ? `${import.meta.env.BASE_URL}art/city-stamps/${definition.stampFile}` : undefined
}
