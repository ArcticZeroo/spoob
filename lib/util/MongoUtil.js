class MongoUtil {
    static save(doc) {
        return new Promise((resolve, reject) => {
            doc.save(err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    static markAndSave(doc, ...props) {
        for (const prop of props) {
            doc.markModified(prop);
        }

        return MongoUtil.save(doc);
    }
}

module.exports = MongoUtil;