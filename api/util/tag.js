
class Tag {
    /**
     * Generate tag count from the photos.
     * @param photos
     * @return Array with objects, containing tag count and
     */
    static generateTagCountsFromPhotos(photos) {
        let tagTerms = {};
        let termCount = 0;

        for(let photo of photos) {
            for(let tag of photo._source.tags) {

                // Check whether the entry is new or not
                if (tagTerms.hasOwnProperty(tag)) {
                    // Increase term count
                    tagTerms[tag] += 1;
                } else {
                    // Create new term entry
                    tagTerms[tag] = 1;
                }

                termCount += 1;
            }
        }

        return {
            tagsFromInitialSearch: tagTerms,
            totalNumberOfTermsInTopKDocuments: termCount
        };
    }
}

export default Tag