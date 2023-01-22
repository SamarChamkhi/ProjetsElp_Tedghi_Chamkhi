package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	// Ouvrez le fichier en lecture
	file, err := os.Open("matrice.txt")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	// Créer un nouveau scanner pour lire le fichier
	scanner := bufio.NewScanner(file)

	// Boucle à travers chaque ligne du fichier
	for scanner.Scan() {
		// Récupérer la ligne actuelle
		line := scanner.Text()

		// Séparer la ligne en colonnes en utilisant un délimiteur de colonne
		columns := strings.Split(line, " ")

		// Afficher les colonnes
		fmt.Println(columns)
	}

	// Vérifiez si il y a eu une erreur en parcourant le fichier
	if err := scanner.Err(); err != nil {
		fmt.Println(err)
	}
}
