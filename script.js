const getAllBooks = async () => {
    const response = await fetch("https://gutendex.com/books");

    if(!response.ok){
        throw new Error(`${response.error}`);
    }
    else{
        const data = await response.json();
        return data;
    }
}

const processInfo = async () => {
    const bookData = await getAllBooks();
    let items = bookData.results;
    
    items.sort((a, b)=> a.id - b.id); //sorting by id

    items.forEach(item => { //capitalising subjects
        let tempSubjects = (item.subjects).map((subject) => {
            return subject.toUpperCase();
        });
        item.subjects = tempSubjects;
    });

    items = items.filter((item) => { //remove entries whose authors have been confirmed to not exist in the past 200 years
        currentYear = new Date().getFullYear();
        for(let curr = 0; curr< (item.authors).length ; curr++){ //for every author in the authors object. if a single author is confirmed to have last existed over 200 years ago, the entire entry will be filtered out
            //if we want to filter out authors with no confirmed birth or death dates, uncomment the below if statement
            /*if(item.authors[curr].death_year == null && (item.authors[curr].birth_year == null || item.authors[curr].birth_year < currentYear-200)){
                return false;
            }*/ 
            if(item.authors[curr].death_year != null){
                if(item.authors[curr].death_year < currentYear-200){
                    return false; //they died over 200 years before the current year, so they didn't exist in the past 200 years
                }
            }
        }
        return true;
    })
};

processInfo();