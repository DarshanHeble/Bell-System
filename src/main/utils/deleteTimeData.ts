import { TabWithRev, TimeData } from '@shared/type'
import { pdbBell } from '../pouchdb'

const deleteTimeData = async (_id: string, timeData: TimeData): Promise<void> => {
  try {
    const doc = await pdbBell.get<TabWithRev>(_id)

    const updatedData = doc.data.filter(
      (item) =>
        item.time.hour !== timeData.time.hour ||
        item.time.minute !== timeData.time.minute ||
        item.time.period !== timeData.time.period ||
        item.label !== timeData.label
      // item.music_file_name !== timeData.music_file_name ||
      // item.switch_state !== timeData.switch_state ||
      // item.days.some(
      //   (day, index) =>
      //     day.active !== timeData.days[index].active || day.day !== timeData.days[index].day
      // )
    )

    // Update the document's data array
    doc.data = updatedData

    // Put the updated document back into the database
    await pdbBell.put(doc)

    console.log(`Deleted time data with label: ${timeData.label}`)
  } catch (error) {
    console.error(error)
  }
}

export default deleteTimeData
