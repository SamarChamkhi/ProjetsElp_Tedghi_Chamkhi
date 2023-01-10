package main

import "fmt"

func main() {
	var lignes, colonnes, i, j int

	var mat1 [10][10]int
	var mat2 [10][10]int
	var matProd [10][10]int

	fmt.Print("Rentrer le nombre de Lignes puis celui de colonnes = ")
	fmt.Scan(&lignes, &colonnes)

	fmt.Print("Rentrer les termes de la première Matrice = ")
	for i = 0; i < lignes; i++ {
		for j = 0; j < colonnes; j++ {
			fmt.Scan(&mat1[i][j])
		}
	}

	fmt.Print("Rentrer les termes de la deuxième Matrice = ")
	for i = 0; i < lignes; i++ {
		for j = 0; j < colonnes; j++ {
			fmt.Scan(&mat2[i][j])
		}
	}

	for i = 0; i < lignes; i++ {
		for j = 0; j < colonnes; j++ {
			matProd[i][j] = mat1[i][j] * mat2[i][j]
		}
	}
	fmt.Println("Le Résultat de Go pour la matrice produit = ")
	for i = 0; i < lignes; i++ {
		for j = 0; j < colonnes; j++ {
			fmt.Print(matProd[i][j], "\t")
		}
		fmt.Println()
	}
	//essaie de commentaire
}
