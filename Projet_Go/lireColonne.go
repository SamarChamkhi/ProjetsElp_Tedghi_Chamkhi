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

	// Initialiser un tableau de tableaux pour stocker les colonnes
	var columns [][]string

	// Créer un nouveau scanner pour lire le fichier
	scanner := bufio.NewScanner(file)

	// Boucle à travers chaque ligne du fichier
	for scanner.Scan() {
		// Récupérer la ligne actuelle
		line := scanner.Text()

		// Séparer la ligne en colonnes en utilisant un délimiteur de colonne
		cols := strings.Split(line, " ")

		// Boucle à travers chaque colonne
		for i, col := range cols {
			// Si le tableau de colonnes n'a pas encore été créé pour cette colonne, créez-le
			if len(columns) < len(cols) {
				columns = append(columns, []string{})
			}

			// Ajouter la valeur de la colonne à la colonne correspondante
			columns[i] = append(columns[i], col)
		}
	}

	// Afficher les colonnes
	for col := range columns {
		fmt.Printf("%v\n", columns[col])
	}

	// Vérifiez si il y a eu une erreur en parcourant le fichier
	if err := scanner.Err(); err != nil {
		fmt.Println(err)
	}
}
