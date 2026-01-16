import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const uploadImage = async(image)=>{
    try {
        const formData = new FormData()
        formData.append('image', image)

        const response = await Axios({
            ...SummaryApi.uploadImage,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        if (response.data && response.data.success) {
            return {
                data: {
                    url: response.data.data.secure_url // Map secure_url to url
                }
            }
        }
        throw new Error(response.data?.message || 'Upload failed')

    } catch (error) {
        return error
    }
}

export default uploadImage