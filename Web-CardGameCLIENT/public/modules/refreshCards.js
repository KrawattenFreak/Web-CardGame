//IMPORT DOM ELEMENTS


export function refreshCards(cards){

    for (let i = 0; i < 10; i++) {
        if(cards[i] != null) {
            console.log(cards[i].CardID)
            document.getElementById("pic"+i).style.display = "block";
            if(i<7) {
                document.getElementById("pic"+i).src="./images/" + cards[i].CardID + ".png";
            }
       
        } else {
            document.getElementById("pic"+i).style.display = "none";
        }

    }





}